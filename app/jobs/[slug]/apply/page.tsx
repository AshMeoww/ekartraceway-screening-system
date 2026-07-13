import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobBySlug } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { ApplicationForm } from "./application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  const user = await getCurrentUser();

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/jobs/${job.slug}`} className="text-sm font-bold text-primary">
          Back to role
        </Link>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Apply for {job.title}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Upload a PDF or DOCX CV. The generated screening result is
              advisory and must be reviewed by HR.
            </p>
          </CardHeader>
          <CardContent>
            <ApplicationForm
              jobId={job.id}
              initialEmail={user?.email ?? ""}
              initialFullName={
                typeof user?.user_metadata.full_name === "string"
                  ? user.user_metadata.full_name
                  : ""
              }
              isSignedIn={Boolean(user)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
