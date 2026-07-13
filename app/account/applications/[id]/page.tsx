import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantApplicationById } from "@/lib/data";
import type { ApplicationStatusHistoryEntry } from "@/lib/types";

export const metadata = {
  title: "Application Detail",
};

export default async function ApplicantApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, application } = await getApplicantApplicationById(id);

  if (!user) {
    redirect("/auth/login");
  }

  if (!application) {
    notFound();
  }

  const parsedProfile = application.parsedProfile;
  const score = application.score;

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/account/applications" className="text-sm font-bold text-primary">
          Back to my applications
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="grid gap-5">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{application.job.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {application.job.department} - {application.job.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{application.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>Submitted {formatDate(application.createdAt)}</p>
                  <p>Updated {formatDate(application.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold">Cover note</p>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {application.coverNote ?? "No cover note supplied."}
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm" className="justify-self-start">
                  <Link href={`/jobs/${application.job.slug}`}>View role</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parsed CV profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoBlock
                    label="Experience"
                    value={`${parsedProfile?.yearsExperience ?? 0} years`}
                  />
                  <InfoBlock
                    label="Education"
                    value={parsedProfile?.education.join(", ") || "Not found"}
                  />
                  <InfoBlock
                    label="Certifications"
                    value={parsedProfile?.certifications.join(", ") || "Not found"}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">Skills detected</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedProfile?.skills.length ? (
                      parsedProfile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills detected.</p>
                    )}
                  </div>
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  {parsedProfile?.rawText ?? "No parsed CV text available."}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advisory score</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Scores support HR review only and are not final hiring decisions.
                </p>
              </CardHeader>
              <CardContent className="grid gap-5">
                {score ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Score label="Final" value={score.finalScore} />
                      <Score label="Semantic" value={score.semanticScore} />
                      <Score label="Rule based" value={score.ruleBasedScore} />
                    </div>
                    <p className="leading-7 text-muted-foreground">{score.explanation}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ListBlock
                        title="Matched requirements"
                        items={score.matchedRequirements}
                        fallback="No matched requirements were stored."
                      />
                      <ListBlock
                        title="Weak areas"
                        items={score.weakAreas}
                        fallback="No major weak areas detected by the scoring rules."
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No score has been generated.</p>
                )}
              </CardContent>
            </Card>
          </section>

          <aside className="grid content-start gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Application timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline
                  createdAt={application.createdAt}
                  history={application.statusHistory}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded documents</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {application.documents.length ? (
                  application.documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"
                    >
                      <FileText className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-bold">{document.fileName}</p>
                        <p className="mt-1 text-muted-foreground">
                          {document.mimeType ?? "Unknown file type"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No document metadata is available.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  fallback,
}: {
  title: string;
  items: string[];
  fallback: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{title}</p>
      <ul className="grid gap-2 text-sm text-muted-foreground">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>{fallback}</li>
        )}
      </ul>
    </div>
  );
}

function StatusTimeline({
  createdAt,
  history,
}: {
  createdAt: string;
  history: ApplicationStatusHistoryEntry[];
}) {
  const events = [
    {
      label: "Application submitted",
      detail: "Your application was received.",
      createdAt,
    },
    ...history.map((entry) => ({
      label: `Moved to ${entry.toStatus}`,
      detail: entry.reason ?? "Status updated by HR.",
      createdAt: entry.createdAt,
    })),
  ];

  return (
    <ol className="grid gap-4">
      {events.map((event) => (
        <li key={`${event.label}-${event.createdAt}`} className="grid gap-1">
          <p className="text-sm font-bold">{event.label}</p>
          <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
          <p className="text-sm leading-6 text-muted-foreground">{event.detail}</p>
        </li>
      ))}
    </ol>
  );
}
