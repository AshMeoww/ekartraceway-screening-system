import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";
import { extractCvText, parseProfileFromText } from "@/lib/cv";
import { getJobById } from "@/lib/data";
import {
  generateEmbedding,
  normalizedEmbeddingScore,
  screeningTextForJob,
  screeningTextForProfile,
  vectorForPostgres,
} from "@/lib/ml";
import { scoreApplicant } from "@/lib/scoring";
import {
  getCurrentUser,
  getSupabaseServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Application could not be submitted.";
}

function safeStorageFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  return normalized || "cv-file";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv");
    const parsedInput = applicationSchema.safeParse({
      jobId: formData.get("jobId"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      coverNote: formData.get("coverNote") || undefined,
    });

    if (!parsedInput.success) {
      return NextResponse.json(
        { error: "Invalid application.", issues: parsedInput.error.flatten() },
        { status: 400 },
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "A PDF, DOCX, or image CV is required." },
        { status: 400 },
      );
    }

    const job = await getJobById(parsedInput.data.jobId);

    if (!job || job.status !== "published") {
      return NextResponse.json({ error: "Published job not found." }, { status: 404 });
    }

    const rawText = await extractCvText(file);
    const parsedProfile = parseProfileFromText(rawText);
    let requirementsEmbedding: number[] | null = null;
    let profileEmbedding: number[] | null = null;
    let semanticScore: number | undefined;
    let semanticSource: "embedding" | "local-text" = "local-text";

    try {
      [requirementsEmbedding, profileEmbedding] = await Promise.all([
        generateEmbedding(screeningTextForJob(job)),
        generateEmbedding(screeningTextForProfile(parsedProfile)),
      ]);
      semanticScore = normalizedEmbeddingScore(requirementsEmbedding, profileEmbedding);
      semanticSource = "embedding";
    } catch {
      requirementsEmbedding = null;
      profileEmbedding = null;
    }

    const score = scoreApplicant(job, parsedProfile, { semanticScore, semanticSource });
    const currentUser = await getCurrentUser();

    if (!isServiceRoleConfigured()) {
      return NextResponse.json({
        id: "demo-application",
        message:
          "Application parsed and scored in demo mode. Configure Supabase service role credentials to persist submissions.",
        parsedProfile,
        score,
      });
    }

    const supabase = getSupabaseServiceClient()!;
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .insert({
        user_id: currentUser?.id ?? null,
        full_name: parsedInput.data.fullName,
        email: parsedInput.data.email,
        phone: parsedInput.data.phone ?? null,
      })
      .select("id")
      .single();

    if (applicantError) {
      return NextResponse.json({ error: applicantError.message }, { status: 500 });
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_id: job.id,
        applicant_id: applicant.id,
        status: "submitted",
        cover_note: parsedInput.data.coverNote ?? null,
      })
      .select("id")
      .single();

    if (applicationError) {
      return NextResponse.json({ error: applicationError.message }, { status: 500 });
    }

    const storagePath = `${application.id}/${crypto.randomUUID()}-${safeStorageFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("applicant-cvs")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    await supabase.from("documents").insert({
      application_id: application.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
    });
    await supabase.from("parsed_profiles").insert({
      application_id: application.id,
      raw_text: parsedProfile.rawText,
      skills: parsedProfile.skills,
      education: parsedProfile.education,
      certifications: parsedProfile.certifications,
      years_experience: parsedProfile.yearsExperience,
      profile_embedding: profileEmbedding ? vectorForPostgres(profileEmbedding) : null,
    });
    if (requirementsEmbedding) {
      await supabase
        .from("jobs")
        .update({ requirements_embedding: vectorForPostgres(requirementsEmbedding) })
        .eq("id", job.id);
    }
    await supabase.from("scores").insert({
      application_id: application.id,
      semantic_score: score.semanticScore,
      skills_score: score.skillsScore,
      experience_score: score.experienceScore,
      education_score: score.educationScore,
      certifications_score: score.certificationsScore,
      rule_based_score: score.ruleBasedScore,
      final_score: score.finalScore,
      matched_requirements: score.matchedRequirements,
      weak_areas: score.weakAreas,
      explanation: score.explanation,
    });
    await supabase.from("audit_logs").insert([
      { application_id: application.id, event_type: "application.created" },
      { application_id: application.id, event_type: "document.uploaded" },
      { application_id: application.id, event_type: "document.parsed" },
      {
        application_id: application.id,
        event_type: "score.generated",
        metadata: { semantic_source: semanticSource },
      },
    ]);

    return NextResponse.json({ id: application.id, parsedProfile, score }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
