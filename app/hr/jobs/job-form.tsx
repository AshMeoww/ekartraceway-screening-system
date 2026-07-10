"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob } from "./actions";

type JobFormState = {
  error?: string;
  ok?: boolean;
};

export function JobForm() {
  const [state, formAction, pending] = useActionState<JobFormState, FormData>(
    createJob,
    { ok: false },
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" name="title" placeholder="Track marshal" />
        <Field label="Department" name="department" placeholder="Operations" />
        <Field label="Location" name="location" placeholder="Main branch" />
        <Field label="Employment type" name="employmentType" placeholder="Full-time" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          placeholder="Concise role overview for applicants."
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextList label="Responsibilities" name="responsibilities" />
        <TextList label="Requirements" name="requirements" required />
        <TextList label="Skills" name="skills" required />
        <TextList label="Education" name="education" />
        <TextList label="Certifications" name="certifications" />
        <div className="grid gap-2">
          <Label htmlFor="minYearsExperience">Minimum years experience</Label>
          <Input
            id="minYearsExperience"
            name="minYearsExperience"
            type="number"
            min="0"
            max="60"
            defaultValue="0"
          />
        </div>
      </div>
      <fieldset className="grid gap-3 rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-bold">Screening weights</legend>
        <div className="grid gap-3 sm:grid-cols-5">
          <Field label="Semantic" name="semanticWeight" type="number" defaultValue="35" />
          <Field label="Skills" name="skillsWeight" type="number" defaultValue="30" />
          <Field label="Experience" name="experienceWeight" type="number" defaultValue="20" />
          <Field label="Education" name="educationWeight" type="number" defaultValue="10" />
          <Field
            label="Certifications"
            name="certificationsWeight"
            type="number"
            defaultValue="5"
          />
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input name="status" type="checkbox" value="published" />
          Publish immediately
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create job"}
        </Button>
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          Job saved.
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={type === "text"}
      />
    </div>
  );
}

function TextList({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        placeholder="One item per line"
        required={required}
      />
    </div>
  );
}
