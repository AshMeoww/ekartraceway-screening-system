"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { setJobStatus } from "./actions";

type JobStatusFormProps = {
  jobId: string;
  status: "draft" | "published";
  label: string;
};

export function JobStatusForm({ jobId, status, label }: JobStatusFormProps) {
  return (
    <form action={setJobStatus} className="flex justify-end">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton label={label} pendingLabel={`${label.replace("Unpublish", "Unpublishing").replace("Publish", "Publishing")}...`} />
    </form>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
