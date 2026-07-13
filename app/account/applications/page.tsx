import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantSavedApplications } from "@/lib/data";
import { signOut } from "@/app/auth/actions";

export const metadata = {
  title: "My Applications",
};

export default async function ApplicantApplicationsPage() {
  const { user, applications } = await getApplicantSavedApplications();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-primary">
              E-Kart Raceway Screening
            </Link>
            <h1 className="mt-3 text-3xl font-black">My applications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/account/profile">Profile</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </header>

        <section className="mt-8 grid gap-4">
          {applications.length > 0 ? (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{application.job.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {application.job.department} - {application.job.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{application.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm text-muted-foreground">
                    Submitted {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  {application.score ? (
                    <div className="rounded-md border border-border p-4">
                      <p className="text-sm font-bold">
                        Advisory score: {application.score.finalScore}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {application.score.explanation}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/account/applications/${application.id}`}>
                        View details
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/jobs/${application.job.slug}`}>View role</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No saved applications yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">
                  Apply while signed in and your submission will appear here.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/jobs">Browse open roles</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
