"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationStatus } from "@/lib/types";
import { updateApplicationStatus } from "./actions";

type StatusFormState = {
  error?: string;
  ok?: boolean;
};

const statuses: ApplicationStatus[] = [
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "rejected",
  "hired",
];

export function StatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [state, formAction, pending] = useActionState(
    async (_state: StatusFormState, formData: FormData): Promise<StatusFormState> =>
      updateApplicationStatus(applicationId, formData),
    { ok: false },
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="overrideReason">Override reason</Label>
        <Textarea
          id="overrideReason"
          name="overrideReason"
          placeholder="Required by policy when HR overrides or explains a status change."
        />
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          Status updated.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save HR review"}
      </Button>
    </form>
  );
}
