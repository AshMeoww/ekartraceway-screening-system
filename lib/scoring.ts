import type { Job, ParsedProfile, ScoreBreakdown, ScreeningWeights } from "@/lib/types";
import { screeningTextForJob } from "@/lib/ml";
import { normalizedSimilarityScore } from "@/lib/text-similarity";

function asLowerSet(values: string[]) {
  return new Set(values.map((value) => value.toLowerCase()));
}

function scoreList(required: string[], actual: string[]) {
  if (required.length === 0) {
    return { score: 100, matched: [] as string[], missing: [] as string[] };
  }

  const actualSet = asLowerSet(actual);
  const matched = required.filter((item) => actualSet.has(item.toLowerCase()));
  const missing = required.filter((item) => !actualSet.has(item.toLowerCase()));

  return {
    score: Math.round((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

function weightedAverage(parts: Record<keyof ScreeningWeights, number>, weights: ScreeningWeights) {
  return Math.round(
    ((parts.semantic * weights.semantic) +
      (parts.skills * weights.skills) +
      (parts.experience * weights.experience) +
      (parts.education * weights.education) +
      (parts.certifications * weights.certifications)) /
      100,
  );
}

export function validateWeights(weights: ScreeningWeights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  return total === 100 && Object.values(weights).every((value) => value >= 0);
}

type ScoreApplicantOptions = {
  semanticScore?: number;
  semanticSource?: "embedding" | "local-text";
};

export function scoreApplicant(
  job: Job,
  profile: ParsedProfile,
  options: ScoreApplicantOptions = {},
): ScoreBreakdown {
  if (!validateWeights(job.weights)) {
    throw new Error("Screening weights must be non-negative and total 100.");
  }

  const semanticScore =
    options.semanticScore ?? normalizedSimilarityScore(screeningTextForJob(job), profile.rawText);
  const semanticSource = options.semanticSource ?? "local-text";
  const skills = scoreList(job.skills, profile.skills);
  const education = scoreList(job.education, profile.education);
  const certifications = scoreList(job.certifications, profile.certifications);
  const experienceScore =
    job.minYearsExperience === 0
      ? 100
      : Math.min(100, Math.round((profile.yearsExperience / job.minYearsExperience) * 100));
  const ruleBasedScore = Math.round(
    (skills.score * 0.46) +
      (experienceScore * 0.31) +
      (education.score * 0.15) +
      (certifications.score * 0.08),
  );
  const finalScore = weightedAverage(
    {
      semantic: semanticScore,
      skills: skills.score,
      experience: experienceScore,
      education: education.score,
      certifications: certifications.score,
    },
    job.weights,
  );
  const weakAreas = [
    ...skills.missing.map((item) => `Missing skill: ${item}`),
    ...education.missing.map((item) => `Education not found: ${item}`),
    ...certifications.missing.map((item) => `Certification not found: ${item}`),
  ];

  if (experienceScore < 100) {
    weakAreas.push(`Experience below target: ${profile.yearsExperience}/${job.minYearsExperience} years`);
  }

  return {
    semanticScore,
    skillsScore: skills.score,
    experienceScore,
    educationScore: education.score,
    certificationsScore: certifications.score,
    ruleBasedScore,
    finalScore,
    matchedRequirements: [...skills.matched, ...education.matched, ...certifications.matched],
    weakAreas,
    explanation:
      semanticSource === "embedding"
        ? "Final score combines local embedding similarity with weighted skills, experience, education, and certification rules. This is advisory only; HR makes all final hiring decisions."
        : "Final score combines local text similarity with weighted skills, experience, education, and certification rules. This is advisory only; HR makes all final hiring decisions.",
  };
}

export function rankApplications<T extends { score?: { finalScore: number }; createdAt: string }>(
  applications: T[],
) {
  return [...applications].sort((left, right) => {
    const scoreDelta = (right.score?.finalScore ?? 0) - (left.score?.finalScore ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}
