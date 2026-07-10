import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobBySlug } from "@/lib/data";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <Button asChild variant="ghost" className="mb-6 px-0">
            <Link href="/jobs">Back to jobs</Link>
          </Button>
          <div className="mb-8">
            <Badge>{job.status}</Badge>
            <h1 className="mt-4 text-4xl font-black">{job.title}</h1>
            <p className="mt-3 text-muted-foreground">
              {job.department} · {job.location} · {job.employmentType}
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              {job.summary}
            </p>
          </div>

          <div className="grid gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 text-muted-foreground">
                  {job.responsibilities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 text-muted-foreground">
                  {job.requirements.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Apply for this role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">
                Submit your details and upload a PDF or DOCX CV. HR will review
                all generated screening output before taking action.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href={`/jobs/${job.slug}/apply`}>Start application</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
