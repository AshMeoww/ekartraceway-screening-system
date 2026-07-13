import { describe, expect, it } from "vitest";
import {
  applicantProfileSchema,
  applicationSchema,
  parseProfileList,
  screeningWeightsSchema,
} from "@/lib/validation";

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

  it("parses applicant profile list fields from lines and commas", () => {
    expect(parseProfileList("customer service\nsafety, first aid")).toEqual([
      "customer service",
      "safety",
      "first aid",
    ]);
  });

  it("accepts valid applicant profile input", () => {
    const result = applicantProfileSchema.safeParse({
      fullName: "Applicant Name",
      email: "applicant@example.com",
      yearsExperience: 2,
      skills: ["customer service"],
      education: ["Hospitality diploma"],
      certifications: ["First aid"],
    });

    expect(result.success).toBe(true);
  });
});
