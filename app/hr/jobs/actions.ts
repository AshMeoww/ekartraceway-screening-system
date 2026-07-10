"use server";

import { revalidatePath } from "next/cache";
import { getCurrentHrUser, getSupabaseServiceClient } from "@/lib/supabase/server";
import { screeningWeightsSchema } from "@/lib/validation";
import type { JobStatus } from "@/lib/types";

type JobActionState = {
  error?: string;
  ok?: boolean;
};

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export async function createJob(
  _state: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const hrUser = await getCurrentHrUser();

  if (!hrUser) {
    return { error: "HR access is required." };
  }

  const weights = screeningWeightsSchema.safeParse({
    semantic: formData.get("semanticWeight"),
    skills: formData.get("skillsWeight"),
    experience: formData.get("experienceWeight"),
    education: formData.get("educationWeight"),
    certifications: formData.get("certificationsWeight"),
  });

  if (!weights.success) {
    return { error: "Screening weights must be valid and total 100." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const requirements = lines(formData.get("requirements"));
  const skills = lines(formData.get("skills"));

  if (title.length < 2 || summary.length < 20 || requirements.length === 0 || skills.length === 0) {
    return { error: "Title, summary, requirements, and skills are required." };
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { error: "Supabase service role credentials are required to save jobs." };
  }

  const status = String(formData.get("status") ?? "draft") as JobStatus;
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`,
      title,
      department: String(formData.get("department") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      employment_type: String(formData.get("employmentType") ?? "").trim(),
      status,
      summary,
      responsibilities: lines(formData.get("responsibilities")),
      requirements,
      skills,
      education: lines(formData.get("education")),
      certifications: lines(formData.get("certifications")),
      min_years_experience: Number(formData.get("minYearsExperience") ?? 0),
      weights: weights.data,
      created_by: hrUser.user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert([
    {
      job_id: job.id,
      actor_id: hrUser.user.id,
      event_type: "job.created",
    },
    ...(status === "published"
      ? [
          {
            job_id: job.id,
            actor_id: hrUser.user.id,
            event_type: "job.published",
          },
        ]
      : []),
  ]);

  revalidatePath("/hr/jobs");
  revalidatePath("/jobs");

  return { ok: true };
}

export async function setJobStatus(formData: FormData) {
  const hrUser = await getCurrentHrUser();

  if (!hrUser) {
    return;
  }

  const jobId = String(formData.get("jobId") ?? "");
  const status = String(formData.get("status") ?? "draft") as JobStatus;
  const supabase = getSupabaseServiceClient();

  if (!supabase || !jobId) {
    return;
  }

  const { error } = await supabase
    .from("jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (!error) {
    await supabase.from("audit_logs").insert({
      job_id: jobId,
      actor_id: hrUser.user.id,
      event_type: status === "published" ? "job.published" : "job.unpublished",
    });
  }

  revalidatePath("/hr/jobs");
  revalidatePath("/jobs");
}
