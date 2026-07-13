import { describe, expect, it } from "vitest";
import {
  cosineSimilarityFromEmbeddings,
  normalizedEmbeddingScore,
  vectorForPostgres,
} from "@/lib/ml";

describe("ml helpers", () => {
  it("normalizes embedding similarity to a 0-100 score", () => {
    expect(normalizedEmbeddingScore([1, 0], [1, 0])).toBe(100);
    expect(normalizedEmbeddingScore([1, 0], [0, 1])).toBe(0);
  });

  it("calculates cosine similarity for local vectors", () => {
    expect(cosineSimilarityFromEmbeddings([1, 1], [1, 1])).toBeCloseTo(1);
  });

  it("formats vectors for pgvector inserts", () => {
    expect(vectorForPostgres([1, 0.5])).toBe("[1.00000000,0.50000000]");
  });
});

