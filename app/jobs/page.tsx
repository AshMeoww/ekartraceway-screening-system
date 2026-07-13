import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedJobs } from "@/lib/data";

export const metadata = {
  title: "Open Roles",
};

export default async function JobsPage() {
  const jobs = await getPublishedJobs();

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-primary">Careers</p>
            <h1 className="mt-2 text-4xl font-black">Open roles</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Applicants can submit structured information and upload a PDF or
              DOCX CV. Screening scores are advisory and reviewed by HR.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">Back home</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {job.department} · {job.location} · {job.employmentType}
                    </p>
                  </div>
                  <Badge>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl leading-7 text-muted-foreground">
                  {job.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button asChild className="mt-6">
                  <Link href={`/jobs/${job.slug}`}>
                    View role
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="pt-5">
                <p className="text-muted-foreground">
                  No published roles are available yet.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
