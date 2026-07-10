"use server";

import { revalidatePath } from "next/cache";
import { statusUpdateSchema } from "@/lib/validation";
import { getCurrentHrUser, getSupabaseServiceClient } from "@/lib/supabase/server";

export async function updateApplicationStatus(applicationId: string, formData: FormData) {
  const hrUser = await getCurrentHrUser();

  if (!hrUser) {
    return { error: "HR access is required." };
  }

  const parsed = statusUpdateSchema.safeParse({
    status: formData.get("status"),
    overrideReason: formData.get("overrideReason") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid status update." };
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      error:
        "Supabase service role credentials are required before status updates can be persisted.",
    };
  }

  const { data: current, error: currentError } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  if (currentError) {
    return { error: currentError.message };
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: parsed.data.status,
      reviewed_by: hrUser.user.id,
      override_reason: parsed.data.overrideReason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("status_history").insert({
    application_id: applicationId,
    from_status: current.status,
    to_status: parsed.data.status,
    changed_by: hrUser.user.id,
    reason: parsed.data.overrideReason ?? null,
  });
  await supabase.from("audit_logs").insert([
    {
      application_id: applicationId,
      actor_id: hrUser.user.id,
      event_type: "status.changed",
      metadata: { from: current.status, to: parsed.data.status },
    },
    ...(parsed.data.overrideReason
      ? [
          {
            application_id: applicationId,
            actor_id: hrUser.user.id,
            event_type: "override.created",
            metadata: { reason: parsed.data.overrideReason },
          },
        ]
      : []),
  ]);

  revalidatePath(`/hr/applications/${applicationId}`);
  revalidatePath("/hr/applications");

  return { ok: true };
}
