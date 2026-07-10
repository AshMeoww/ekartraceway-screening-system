import type { Application, Job } from "@/lib/types";
import { rankApplications } from "@/lib/scoring";
import { sampleApplications, sampleJobs } from "@/lib/sample-data";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  status: "draft" | "published" | "closed";
  summary: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  education: string[];
  certifications: string[];
  min_years_experience: number;
  weights: Job["weights"];
  created_at: string;
};

type ApplicantRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type ParsedProfileRow = {
  raw_text: string;
  skills: string[] | null;
  education: string[] | null;
  certifications: string[] | null;
  years_experience: number | null;
};

type ScoreRow = {
  semantic_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  certifications_score: number;
  rule_based_score: number;
  final_score: number;
  matched_requirements: string[] | null;
  weak_areas: string[] | null;
  explanation: string;
};

type DocumentRow = {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
};

type ApplicationRow = {
  id: string;
  job_id: string;
  status: Application["status"];
  cover_note: string | null;
  created_at: string;
  updated_at: string;
  override_reason: string | null;
  applicants: ApplicantRow | ApplicantRow[] | null;
  parsed_profiles: ParsedProfileRow | ParsedProfileRow[] | null;
  documents: DocumentRow | DocumentRow[] | null;
  scores: ScoreRow | ScoreRow[] | null;
};

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    status: row.status,
    summary: row.summary,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    skills: row.skills ?? [],
    education: row.education ?? [],
    certifications: row.certifications ?? [],
    minYearsExperience: row.min_years_experience,
    weights: row.weights,
    createdAt: row.created_at,
  };
}

export async function getPublishedJobs() {
  if (!isSupabaseConfigured()) {
    return sampleJobs.filter((job) => job.status === "published");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as JobRow[]).map(mapJob);
}

export async function getJobBySlug(slug: string) {
  if (!isSupabaseConfigured()) {
    return sampleJobs.find((job) => job.slug === slug && job.status === "published") ?? null;
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapJob(data as JobRow) : null;
}

export async function getJobById(id: string) {
  if (!isSupabaseConfigured()) {
    return sampleJobs.find((job) => job.id === id) ?? null;
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapJob(data as JobRow) : null;
}

export async function getHrJobs() {
  if (!isSupabaseConfigured()) {
    return sampleJobs;
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as JobRow[]).map(mapJob);
}

export async function getHrApplications() {
  if (!isSupabaseConfigured()) {
    return rankApplications(sampleApplications);
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("applications")
    .select(
      "id, job_id, status, cover_note, created_at, updated_at, override_reason, applicants(id, full_name, email, phone), documents(id, file_name, mime_type, size_bytes), parsed_profiles(raw_text, skills, education, certifications, years_experience), scores(semantic_score, skills_score, experience_score, education_score, certifications_score, rule_based_score, final_score, matched_requirements, weak_areas, explanation)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const applications = (data as unknown as ApplicationRow[]).map((row): Application => {
    const applicant = Array.isArray(row.applicants) ? row.applicants[0] : row.applicants;
    const parsed = Array.isArray(row.parsed_profiles)
      ? row.parsed_profiles[0]
      : row.parsed_profiles;
    const documents = Array.isArray(row.documents)
      ? row.documents
      : row.documents
        ? [row.documents]
        : [];
    const score = Array.isArray(row.scores) ? row.scores[0] : row.scores;

    if (!applicant) {
      throw new Error(`Application ${row.id} is missing an applicant relation.`);
    }

    return {
      id: row.id,
      jobId: row.job_id,
      status: row.status,
      coverNote: row.cover_note ?? undefined,
      overrideReason: row.override_reason ?? undefined,
      applicant: {
        id: applicant.id,
        fullName: applicant.full_name,
        email: applicant.email,
        phone: applicant.phone ?? undefined,
      },
      parsedProfile: parsed
        ? {
            rawText: parsed.raw_text,
            skills: parsed.skills ?? [],
            education: parsed.education ?? [],
            certifications: parsed.certifications ?? [],
            yearsExperience: parsed.years_experience ?? 0,
          }
        : undefined,
      documents: documents.map((document) => ({
        id: document.id,
        fileName: document.file_name,
        mimeType: document.mime_type ?? undefined,
        sizeBytes: document.size_bytes ?? undefined,
      })),
      score: score
        ? {
            semanticScore: score.semantic_score,
            skillsScore: score.skills_score,
            experienceScore: score.experience_score,
            educationScore: score.education_score,
            certificationsScore: score.certifications_score,
            ruleBasedScore: score.rule_based_score,
            finalScore: score.final_score,
            matchedRequirements: score.matched_requirements ?? [],
            weakAreas: score.weak_areas ?? [],
            explanation: score.explanation,
          }
        : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return rankApplications(applications);
}

export async function getHrApplicationById(id: string) {
  const applications = await getHrApplications();
  return applications.find((application) => application.id === id) ?? null;
}
