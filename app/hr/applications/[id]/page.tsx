import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrApplicationById } from "@/lib/data";
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
              <CardTitle>Parsed profile</CardTitle>
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
              <CardTitle>Advisory score explanation</CardTitle>
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
                  <div>
                    <p className="mb-2 text-sm font-bold">Weak areas</p>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {score.weakAreas.length > 0 ? (
                        score.weakAreas.map((area) => <li key={area}>{area}</li>)
                      ) : (
                        <li>No major weak areas detected by the scoring rules.</li>
                      )}
                    </ul>
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

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
