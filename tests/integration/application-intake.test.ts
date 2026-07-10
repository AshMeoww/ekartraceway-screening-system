import { describe, expect, it } from "vitest";
import { sampleJobs } from "@/lib/sample-data";
import { parseProfileFromText } from "@/lib/cv";
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
});
