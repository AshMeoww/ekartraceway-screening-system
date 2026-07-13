import { describe, expect, it } from "vitest";
import { sampleJobs } from "@/lib/sample-data";
import { parseProfileFromText } from "@/lib/cv";
import { normalizedEmbeddingScore } from "@/lib/ml";
import { scoreApplicant } from "@/lib/scoring";

describe("application intake integration", () => {
  it("parses a CV-like text and generates a score for a published job", () => {
    const profile = parseProfileFromText(
      "Customer service associate with 3 years of operations, safety communication, and first aid certification.",
    );
    const score = scoreApplicant(sampleJobs[0], profile);

    expect(profile.skills).toContain("customer service");
    expect(score.finalScore).toBeGreaterThan(50);
    expect(score.weakAreas).toEqual(expect.any(Array));
  });

  it("can score intake with an embedding-derived semantic score", () => {
    const profile = parseProfileFromText(
      "Customer service associate with safety communication and first aid.",
    );
    const semanticScore = normalizedEmbeddingScore([1, 0], [1, 0]);
    const score = scoreApplicant(sampleJobs[0], profile, {
      semanticScore,
      semanticSource: "embedding",
    });

    expect(score.semanticScore).toBe(100);
    expect(score.explanation).toContain("embedding similarity");
    expect(score.explanation).toContain("HR makes all final hiring decisions");
  });
});
