import { z } from "zod";
import { defaultWeights } from "@/lib/sample-data";

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  fullName: z.string().trim().min(2, "Enter the applicant's full name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional(),
  coverNote: z.string().trim().max(2000).optional(),
});

export const applicantProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional(),
  headline: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  skills: z.array(z.string().trim().min(1)).max(50),
  education: z.array(z.string().trim().min(1)).max(30),
  certifications: z.array(z.string().trim().min(1)).max(30),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["submitted", "screening", "shortlisted", "interview", "rejected", "hired"]),
  overrideReason: z.string().trim().max(1000).optional(),
});

export const jobStatusSchema = z.enum(["draft", "published", "closed"]);

export const jobSchema = z.object({
  title: z.string().trim().min(2, "Enter a job title."),
  department: z.string().trim().min(2, "Enter a department."),
  location: z.string().trim().min(2, "Enter a location."),
  employmentType: z.string().trim().min(2, "Enter an employment type."),
  summary: z.string().trim().min(1, "Enter a role summary."),
  requirements: z.array(z.string().trim().min(1)).min(1, "Add at least one requirement."),
  skills: z.array(z.string().trim().min(1)).min(1, "Add at least one skill."),
  minYearsExperience: z.coerce.number().int().min(0).max(60),
});

export const screeningWeightsSchema = z
  .object({
    semantic: z.coerce.number().min(0).max(100),
    skills: z.coerce.number().min(0).max(100),
    experience: z.coerce.number().min(0).max(100),
    education: z.coerce.number().min(0).max(100),
    certifications: z.coerce.number().min(0).max(100),
  })
  .refine(
    (weights) =>
      Object.values(weights).reduce((total, value) => total + value, 0) === 100,
    "Screening weights must total 100.",
  );

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicantProfileInput = z.infer<typeof applicantProfileSchema>;

export function parseProfileList(value: FormDataEntryValue | string[] | null) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getDefaultWeights() {
  return screeningWeightsSchema.parse(defaultWeights);
}
