import { describe, expect, it } from "vitest";
import { normalizedSimilarityScore, tokenize } from "@/lib/text-similarity";

describe("text similarity", () => {
  it("normalizes tokens and removes filler words", () => {
    expect(tokenize("The HR and operations role")).toEqual(["hr", "operations", "role"]);
  });

  it("scores related text higher than unrelated text", () => {
    const related = normalizedSimilarityScore("customer service safety", "safety and customer service");
    const unrelated = normalizedSimilarityScore("customer service safety", "accounting payroll finance");

    expect(related).toBeGreaterThan(unrelated);
  });
});
