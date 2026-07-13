import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Brain, CheckCircle2, FileText, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrApplicationById } from "@/lib/data";
import type { Application } from "@/lib/types";
import { StatusForm } from "./status-form";

export default async function HrApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getHrApplicationById(id);

  if (!application) {
    notFound();
  }

  const score = application.score;
  const parsedProfile = application.parsedProfile;
  const jobTitle = application.job?.title ?? "Linked job";

  return (
    <main>
      <Link href="/hr/applications" className="text-sm font-bold text-primary">
        Back to applications
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="grid gap-5">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{application.applicant.fullName}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {application.applicant.email}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {jobTitle}
                  </p>
                </div>
                <Badge variant="secondary">{application.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">
                {application.coverNote ?? "No cover note supplied."}
              </p>
              {application.documents?.length ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {application.documents.map((document) => (
                    <Button key={document.id} asChild variant="secondary" size="sm">
                      <a
                        href={`/api/hr/documents/${document.id}/signed-url`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        {document.fileName}
                      </a>
                    </Button>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle>Parsed profile</CardTitle>
                <Badge
                  variant={
                    parsedProfile?.extractionMethod === "ocr" ? "default" : "secondary"
                  }
                >
                  {formatExtraction(application)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-bold">Experience</p>
                  <p className="text-muted-foreground">
                    {parsedProfile?.yearsExperience ?? 0} years
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">Education</p>
                  <p className="text-muted-foreground">
                    {parsedProfile?.education.join(", ") || "Not found"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">Certifications</p>
                  <p className="text-muted-foreground">
                    {parsedProfile?.certifications.join(", ") || "Not found"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedProfile?.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                {parsedProfile?.rawText ?? "No parsed CV text available."}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle>Why this score?</CardTitle>
                <Badge variant="warning">Advisory only</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {score ? (
                <>
                  <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-warning">
                    This score is a review aid. HR must evaluate the CV, role context, and
                    interview evidence before making any hiring decision.
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <Score label="Final advisory score" value={score.finalScore} icon="scale" />
                    <Score label="Semantic fit" value={score.semanticScore} icon="brain" />
                    <Score label="Skills" value={score.skillsScore} />
                    <Score label="Experience" value={score.experienceScore} />
                    <Score label="Education" value={score.educationScore} />
                    <Score label="Certifications" value={score.certificationsScore} />
                  </div>

                  <div className="rounded-md border border-border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                      <Brain className="h-4 w-4 text-primary" />
                      Explanation
                    </div>
                    <p className="leading-7 text-muted-foreground">{score.explanation}</p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailList
                      icon="matched"
                      title="Matched requirements"
                      empty="No direct requirement matches were detected."
                      items={score.matchedRequirements}
                    />
                    <DetailList
                      icon="weak"
                      title="Weak areas"
                      empty="No major weak areas detected by the scoring rules."
                      items={score.weakAreas}
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No score has been generated.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>HR decision log</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusForm
                applicationId={application.id}
                currentStatus={application.status}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function formatExtraction(application: Application) {
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

function Score({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: "brain" | "scale";
}) {
  const Icon = icon === "brain" ? Brain : icon === "scale" ? Scale : ShieldCheck;
  const barColor =
    value >= 75 ? "bg-success" : value >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DetailList({
  empty,
  icon,
  items,
  title,
}: {
  empty: string;
  icon: "matched" | "weak";
  items: string[];
  title: string;
}) {
  const Icon = icon === "matched" ? CheckCircle2 : AlertTriangle;
  const iconClass = icon === "matched" ? "text-success" : "text-destructive";

  return (
    <div className="rounded-md border border-border p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {title}
      </div>
      <ul className="grid gap-2 text-sm text-muted-foreground">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>{empty}</li>
        )}
      </ul>
    </div>
  );
}
