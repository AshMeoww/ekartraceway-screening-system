"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateEmbedding, screeningTextForJob, vectorForPostgres } from "@/lib/ml";
import { getCurrentHrUser, getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  jobSchema,
  jobStatusSchema,
  parseProfileList,
  screeningWeightsSchema,
} from "@/lib/validation";
import type { Job } from "@/lib/types";

type JobActionState = {
  error?: string;
  ok?: boolean;
};

function lines(value: FormDataEntryValue | null) {
  return parseProfileList(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function encoded(value: string) {
  return encodeURIComponent(value);
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && error.message === "request-timeout";
}

async function withTimeout<T>(promise: PromiseLike<T>, ms = 8000) {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("request-timeout")), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
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

  const parsedJob = jobSchema.safeParse({
    title: formData.get("title"),
    department: formData.get("department"),
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    summary: formData.get("summary"),
    requirements: lines(formData.get("requirements")),
    skills: lines(formData.get("skills")),
    minYearsExperience: formData.get("minYearsExperience") ?? 0,
  });

  if (!parsedJob.success) {
    return {
      error:
        parsedJob.error.issues[0]?.message ??
        "Title, summary, requirements, and skills are required.",
    };
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return { error: "Supabase service role credentials are required to save jobs." };
  }

  const parsedStatus = jobStatusSchema.safeParse(formData.get("status") ?? "draft");

  if (!parsedStatus.success) {
    return { error: "Invalid job status." };
  }

  const jobInput = parsedJob.data;
  const status = parsedStatus.data;
  const responsibilities = lines(formData.get("responsibilities"));
  const education = lines(formData.get("education"));
  const certifications = lines(formData.get("certifications"));
  const jobForEmbedding: Job = {
    id: "pending",
    slug: "pending",
    title: jobInput.title,
    department: jobInput.department,
    location: jobInput.location,
    employmentType: jobInput.employmentType,
    status,
    summary: jobInput.summary,
    responsibilities,
    requirements: jobInput.requirements,
    skills: jobInput.skills,
    education,
    certifications,
    minYearsExperience: jobInput.minYearsExperience,
    weights: weights.data,
    createdAt: new Date().toISOString(),
  };
  let requirementsEmbedding: string | null = null;

  try {
    requirementsEmbedding = vectorForPostgres(
      await generateEmbedding(screeningTextForJob(jobForEmbedding)),
    );
  } catch {
    requirementsEmbedding = null;
  }

  let createResult;

  try {
    createResult = await withTimeout(
      supabase
        .from("jobs")
        .insert({
          slug: `${slugify(jobInput.title)}-${crypto.randomUUID().slice(0, 8)}`,
          title: jobInput.title,
          department: jobInput.department,
          location: jobInput.location,
          employment_type: jobInput.employmentType,
          status,
          summary: jobInput.summary,
          responsibilities,
          requirements: jobInput.requirements,
          skills: jobInput.skills,
          education,
          certifications,
          min_years_experience: jobInput.minYearsExperience,
          weights: weights.data,
          requirements_embedding: requirementsEmbedding,
          created_by: hrUser.user.id,
        })
        .select("id")
        .single(),
    );
  } catch (error: unknown) {
    if (isTimeoutError(error)) {
      return {
        error:
          "Supabase took too long to create the job. Check your project connection and try again.",
      };
    }

    throw error;
  }

  const { data: job, error } = createResult;

  if (error) {
    return { error: error.message };
  }

  void supabase.from("audit_logs").insert([
    {
      job_id: job.id,
      actor_id: hrUser.user.id,
      event_type: "job.created",
      metadata: { requirements_embedding: Boolean(requirementsEmbedding) },
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
    redirect("/hr/jobs?error=HR%20access%20is%20required.");
  }

  const jobId = String(formData.get("jobId") ?? "");
  const parsedStatus = jobStatusSchema.safeParse(formData.get("status") ?? "draft");
  const supabase = getSupabaseServiceClient();

  if (!jobId) {
    redirect("/hr/jobs?error=Missing%20job%20id.");
  }

  if (!parsedStatus.success) {
    redirect("/hr/jobs?error=Invalid%20job%20status.");
  }

  if (!supabase) {
    redirect(
      "/hr/jobs?error=Supabase%20service%20role%20credentials%20are%20required%20to%20publish%20jobs.",
    );
  }

  const status = parsedStatus.data;
  let updateResult;

  try {
    updateResult = await withTimeout(
      supabase
        .from("jobs")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", jobId),
    );
  } catch (error: unknown) {
    if (isTimeoutError(error)) {
      redirect(
        "/hr/jobs?error=Supabase%20took%20too%20long%20to%20publish%20the%20job.%20Check%20your%20project%20connection%20and%20try%20again.",
      );
    }

    throw error;
  }

  const { error } = updateResult;

  if (error) {
    redirect(`/hr/jobs?error=${encoded(error.message)}`);
  }

  void supabase.from("audit_logs").insert({
    job_id: jobId,
    actor_id: hrUser.user.id,
    event_type: status === "published" ? "job.published" : "job.unpublished",
  });

  revalidatePath("/hr/jobs");
  revalidatePath("/jobs");
  redirect(
    `/hr/jobs?message=${status === "published" ? "Job%20published." : "Job%20unpublished."}`,
  );
}
