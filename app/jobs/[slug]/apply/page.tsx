import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantProfile, getJobBySlug } from "@/lib/data";
import { ApplicationForm } from "./application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  const { user, profile } = await getApplicantProfile();

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
              initialEmail={profile?.email ?? user?.email ?? ""}
              initialFullName={
                profile?.fullName ??
                (typeof user?.user_metadata.full_name === "string"
                  ? user.user_metadata.full_name
                  : "")
              }
              initialPhone={profile?.phone ?? ""}
              isSignedIn={Boolean(user)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
