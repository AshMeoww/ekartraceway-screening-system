import { z } from "zod";
import { defaultWeights } from "@/lib/sample-data";

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  fullName: z.string().trim().min(2, "Enter the applicant's full name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional(),
  coverNote: z.string().trim().max(2000).optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["submitted", "screening", "shortlisted", "interview", "rejected", "hired"]),
  overrideReason: z.string().trim().max(1000).optional(),
});

export const jobSchema = z.object({
  title: z.string().trim().min(2),
  department: z.string().trim().min(2),
  location: z.string().trim().min(2),
  employmentType: z.string().trim().min(2),
  summary: z.string().trim().min(20),
  requirements: z.array(z.string().trim().min(1)).min(1),
  skills: z.array(z.string().trim().min(1)).min(1),
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

export function getDefaultWeights() {
  return screeningWeightsSchema.parse(defaultWeights);
}
