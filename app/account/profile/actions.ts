"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  applicantProfileSchema,
  parseProfileList,
} from "@/lib/validation";
import {
  getCurrentUser,
  getSupabaseServerClient,
} from "@/lib/supabase/server";

function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : undefined;
}

function encoded(value: string) {
  return encodeURIComponent(value);
}

function isMissingApplicantProfilesTable(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    (error.message?.includes("applicant_profiles") &&
      error.message.includes("schema cache"))
  );
}

export async function saveApplicantProfile(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const parsedProfile = applicantProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: optionalText(formData.get("phone")),
    headline: optionalText(formData.get("headline")),
    location: optionalText(formData.get("location")),
    yearsExperience: formData.get("yearsExperience") ?? 0,
    skills: parseProfileList(formData.get("skills")),
    education: parseProfileList(formData.get("education")),
    certifications: parseProfileList(formData.get("certifications")),
  });

  if (!parsedProfile.success) {
    const firstError =
      parsedProfile.error.issues[0]?.message ?? "Profile details are invalid.";
    redirect(`/account/profile?error=${encoded(firstError)}`);
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/account/profile?error=supabase-not-configured");
  }

  const { error } = await supabase.from("applicant_profiles").upsert({
    id: user.id,
    full_name: parsedProfile.data.fullName,
    email: parsedProfile.data.email,
    phone: parsedProfile.data.phone ?? null,
    headline: parsedProfile.data.headline ?? null,
    location: parsedProfile.data.location ?? null,
    years_experience: parsedProfile.data.yearsExperience,
    skills: parsedProfile.data.skills,
    education: parsedProfile.data.education,
    certifications: parsedProfile.data.certifications,
  });

  if (error) {
    if (isMissingApplicantProfilesTable(error)) {
      redirect(
        "/account/profile?error=Apply%20the%20applicant_profiles%20Supabase%20migration%2C%20then%20reload%20the%20page.",
      );
    }

    redirect(`/account/profile?error=${encoded(error.message)}`);
  }

  revalidatePath("/account/profile");
  revalidatePath("/account/applications");
  redirect("/account/profile?saved=1");
}
