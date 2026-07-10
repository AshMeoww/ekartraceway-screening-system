import { describe, expect, it } from "vitest";
import { sampleApplications, sampleJobs } from "@/lib/sample-data";
import { rankApplications, scoreApplicant, validateWeights } from "@/lib/scoring";

describe("scoring", () => {
  it("validates weight totals", () => {
    expect(validateWeights(sampleJobs[0].weights)).toBe(true);
    expect(
      validateWeights({
        semantic: 35,
        skills: 30,
        experience: 20,
        education: 10,
        certifications: 10,
      }),
    ).toBe(false);
  });

  it("produces an explainable advisory score", () => {
    const score = scoreApplicant(sampleJobs[0], {
      rawText:
        "Customer service operations associate with first aid, safety communication, and 3 years experience.",
      skills: ["customer service", "operations", "safety", "communication"],
      education: ["high school diploma"],
      certifications: ["first aid"],
      yearsExperience: 3,
    });

    expect(score.finalScore).toBeGreaterThan(75);
    expect(score.matchedRequirements).toContain("customer service");
    expect(score.explanation).toContain("advisory");
  });

  it("ranks by final score before creation date", () => {
    const ranked = rankApplications([
      { ...sampleApplications[0], id: "low", score: { finalScore: 10 } as never },
      { ...sampleApplications[0], id: "high", score: { finalScore: 90 } as never },
    ]);

    expect(ranked[0].id).toBe("high");
  });
});
