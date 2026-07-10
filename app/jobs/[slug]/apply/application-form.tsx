"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  jobId: string;
};

export function ApplicationForm({ jobId }: Props) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { jobId },
  });

  async function onSubmit(values: ApplicationInput) {
    setResult(null);
    setServerError(null);

    if (!cvFile) {
      setServerError("Upload a PDF or DOCX CV.");
      return;
    }

    const formData = new FormData();
    formData.set("jobId", values.jobId);
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("phone", values.phone ?? "");
    formData.set("coverNote", values.coverNote ?? "");
    formData.set("cv", cvFile);

    const response = await fetch("/api/applications", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();

    if (!response.ok) {
      setServerError(body.error ?? "Application could not be submitted.");
      return;
    }

    setResult(
      body.message ??
        "Application submitted. HR will review the parsed profile and advisory score.",
    );
    reset({ jobId });
    setCvFile(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <input type="hidden" value={jobId} {...register("jobId")} />
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="coverNote">Cover note</Label>
        <Textarea id="coverNote" {...register("coverNote")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cv">CV file</Label>
        <Input
          id="cv"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
        />
      </div>
      {serverError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      ) : null}
      {result ? (
        <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          {result}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit application"}
      </Button>
    </form>
  );
}
