import type { Job, ParsedProfile } from "@/lib/types";

export const EMBEDDING_DIMENSIONS = 384;
export const EMBEDDING_MODEL = "Supabase/gte-small";

type FeatureExtractionPipeline = (
  text: string,
  options: { pooling: "mean"; normalize: true },
) => Promise<{ data: Iterable<number> | ArrayLike<number>; dims?: number[] }>;

let embeddingPipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

export function screeningTextForJob(job: Job) {
  return [
    job.title,
    job.summary,
    ...job.requirements,
    ...job.skills,
    ...job.education,
    ...job.certifications,
  ].join(" ");
}

export function screeningTextForProfile(profile: ParsedProfile) {
  return [
    profile.rawText,
    ...profile.skills,
    ...profile.education,
    ...profile.certifications,
    `${profile.yearsExperience} years experience`,
  ].join(" ");
}

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = import("@huggingface/transformers").then(
      async ({ LogLevel, env, pipeline }) => {
        env.logLevel = LogLevel.ERROR;
        env.cacheDir = ".cache/transformers";

        return pipeline("feature-extraction", EMBEDDING_MODEL, {
          dtype: "q8",
        }) as Promise<FeatureExtractionPipeline>;
      },
    );
  }

  return embeddingPipelinePromise;
}

function embeddingInput(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 8000);
}

export async function generateEmbedding(text: string) {
  const input = embeddingInput(text);

  if (!input) {
    throw new Error("Text is required to generate an embedding.");
  }

  const extractor = await getEmbeddingPipeline();
  const output = await extractor(input, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data, Number);

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding model returned ${embedding.length} dimensions; expected ${EMBEDDING_DIMENSIONS}.`,
    );
  }

  return embedding;
}

export function cosineSimilarityFromEmbeddings(left: number[], right: number[]) {
  if (left.length !== right.length || left.length === 0) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function normalizedEmbeddingScore(left: number[], right: number[]) {
  const similarity = cosineSimilarityFromEmbeddings(left, right);
  return Math.max(0, Math.min(100, Math.round(similarity * 100)));
}

export function vectorForPostgres(embedding: number[]) {
  return `[${embedding.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

