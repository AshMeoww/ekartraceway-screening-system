import { describe, expect, it } from "vitest";
import { applicationSchema, screeningWeightsSchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("accepts valid applicant input", () => {
    const result = applicationSchema.safeParse({
      jobId: "job-1",
      fullName: "Applicant Name",
      email: "applicant@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid weights", () => {
    const result = screeningWeightsSchema.safeParse({
      semantic: 35,
      skills: 30,
      experience: 20,
      education: 10,
      certifications: 10,
    });

    expect(result.success).toBe(false);
  });
});
