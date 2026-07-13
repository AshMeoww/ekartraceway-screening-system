"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  jobId: string;
  initialEmail?: string;
  initialFullName?: string;
  initialPhone?: string;
  isSignedIn?: boolean;
};

type ApplicationResponseBody = {
  error?: string;
  message?: string;
};

async function readApplicationResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as ApplicationResponseBody;
  }

  try {
    return JSON.parse(text) as ApplicationResponseBody;
  } catch {
    return {
      error: response.ok
        ? undefined
        : "Application could not be submitted. The server returned an unreadable response.",
    };
  }
}

export function ApplicationForm({
  jobId,
  initialEmail = "",
  initialFullName = "",
  initialPhone = "",
  isSignedIn = false,
}: Props) {
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
    defaultValues: {
      jobId,
      email: initialEmail,
      fullName: initialFullName,
      phone: initialPhone,
    },
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
    const body = await readApplicationResponse(response);

    if (!response.ok) {
      setServerError(body.error ?? "Application could not be submitted.");
      return;
    }

    setResult(
      body.message ??
        "Application submitted. HR will review the parsed profile and advisory score.",
    );
    reset({
      jobId,
      email: initialEmail,
      fullName: initialFullName,
      phone: initialPhone,
    });
    setCvFile(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
        {isSignedIn ? (
          <>
            You are signed in. This application will be saved to{" "}
            <Link href="/account/applications" className="font-bold text-primary">
              My applications
            </Link>
            .
          </>
        ) : (
          <>
            You can submit as a guest, or{" "}
            <Link href="/auth/signup" className="font-bold text-primary">
              create an applicant account
            </Link>{" "}
            to save and track this application.
          </>
        )}
      </div>
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
