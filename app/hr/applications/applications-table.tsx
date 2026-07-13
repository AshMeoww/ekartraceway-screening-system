"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDownUp, Brain, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application, ApplicationStatus } from "@/lib/types";

type SortMode =
  | "rank"
  | "score-low"
  | "semantic"
  | "newest"
  | "weak-areas";

const statuses: Array<ApplicationStatus | "all"> = [
  "all",
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "rejected",
  "hired",
];

function roleLabel(application: Application) {
  return application.job?.title ?? application.jobId;
}

function extractionLabel(application: Application) {
  const profile = application.parsedProfile;

  if (!profile) {
    return "Not parsed";
  }

  const method = profile.extractionMethod === "ocr" ? "OCR" : "Direct";
  const source =
    profile.extractionSource && profile.extractionSource !== "unknown"
      ? profile.extractionSource
      : inferExtractionSource(application);
  return `${method} ${source.toUpperCase()}`;
}

function inferExtractionSource(application: Application) {
  const document = application.documents?.[0];
  const fileName = document?.fileName.toLowerCase() ?? "";
  const mimeType = document?.mimeType?.toLowerCase() ?? "";

  if (fileName.endsWith(".pdf") || mimeType === "application/pdf") {
    return "pdf";
  }

  if (
    fileName.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }

  if (
    /\.(png|jpe?g|webp|bmp|tiff?)$/.test(fileName) ||
    mimeType.startsWith("image/")
  ) {
    return "image";
  }

  return "unknown";
}

function weakAreaPreview(application: Application) {
  const weakAreas = application.score?.weakAreas ?? [];

  if (weakAreas.length === 0) {
    return "No major weak areas";
  }

  return weakAreas.slice(0, 2).join("; ");
}

function sortApplications(applications: Application[], sortMode: SortMode) {
  return [...applications].sort((left, right) => {
    if (sortMode === "score-low") {
      return (left.score?.finalScore ?? 0) - (right.score?.finalScore ?? 0);
    }

    if (sortMode === "semantic") {
      return (right.score?.semanticScore ?? 0) - (left.score?.semanticScore ?? 0);
    }

    if (sortMode === "newest") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (sortMode === "weak-areas") {
      return (right.score?.weakAreas.length ?? 0) - (left.score?.weakAreas.length ?? 0);
    }

    const scoreDelta = (right.score?.finalScore ?? 0) - (left.score?.finalScore ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return (right.score?.semanticScore ?? 0) - (left.score?.semanticScore ?? 0);
  });
}

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [role, setRole] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("rank");
  const [minScore, setMinScore] = useState("");
  const [weakOnly, setWeakOnly] = useState(false);

  const roles = useMemo(
    () => Array.from(new Set(applications.map(roleLabel))).sort(),
    [applications],
  );
  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minimumScore = minScore ? Number(minScore) : null;
    const filtered = applications.filter((application) => {
      const score = application.score;
      const searchable = [
        application.applicant.fullName,
        application.applicant.email,
        roleLabel(application),
        application.status,
        ...(score?.weakAreas ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (status === "all" || application.status === status) &&
        (role === "all" || roleLabel(application) === role) &&
        (minimumScore === null || (score?.finalScore ?? 0) >= minimumScore) &&
        (!weakOnly || Boolean(score?.weakAreas.length))
      );
    });

    return sortApplications(filtered, sortMode);
  }, [applications, minScore, query, role, sortMode, status, weakOnly]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-md border border-border bg-background p-4 md:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr_0.6fr_auto]">
        <label className="grid gap-2 text-sm font-bold">
          Search
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-normal outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Applicant, email, role, weak area"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus | "all")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All statuses" : item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Job
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          >
            <option value="all">All jobs</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Sort
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          >
            <option value="rank">Best rank</option>
            <option value="semantic">Semantic fit</option>
            <option value="score-low">Lowest score</option>
            <option value="weak-areas">Most weak areas</option>
            <option value="newest">Newest</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Min score
          <input
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
            inputMode="numeric"
            min="0"
            max="100"
            placeholder="0"
            type="number"
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-bold">
          <input
            checked={weakOnly}
            onChange={(event) => setWeakOnly(event.target.checked)}
            className="h-4 w-4"
            type="checkbox"
          />
          Weak only
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {filteredApplications.length} of {applications.length} applications
        </span>
        <span className="inline-flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Scores are advisory review signals
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-bold">Applicant</th>
              <th className="px-4 py-3 font-bold">Job</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Score</th>
              <th className="px-4 py-3 font-bold">Semantic</th>
              <th className="px-4 py-3 font-bold">Weak areas</th>
              <th className="px-4 py-3 font-bold">CV parsing</th>
              <th className="px-4 py-3 font-bold">Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <tr key={application.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-bold">{application.applicant.fullName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.applicant.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{roleLabel(application)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.job?.department ?? "Department not linked"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{application.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge value={application.score?.finalScore ?? 0} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-bold">
                      <Brain className="h-4 w-4 text-primary" />
                      {application.score?.semanticScore ?? 0}
                    </span>
                  </td>
                  <td className="max-w-72 px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-start gap-2">
                      {(application.score?.weakAreas.length ?? 0) > 0 ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      ) : null}
                      {weakAreaPreview(application)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        application.parsedProfile?.extractionMethod === "ocr"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {extractionLabel(application)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/hr/applications/${application.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No applications match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const variant = value >= 75 ? "default" : value >= 50 ? "secondary" : "destructive";

  return <Badge variant={variant}>{value}</Badge>;
}
