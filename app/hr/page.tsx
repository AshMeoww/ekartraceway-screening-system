import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrApplications, getHrJobs } from "@/lib/data";

export const metadata = {
  title: "HR Dashboard",
};

export default async function HrDashboardPage() {
  const [jobs, applications] = await Promise.all([getHrJobs(), getHrApplications()]);
  const averageScore =
    applications.length === 0
      ? 0
      : Math.round(
          applications.reduce(
            (total, application) => total + (application.score?.finalScore ?? 0),
            0,
          ) / applications.length,
        );

  return (
    <main>
      <div className="mb-8">
        <p className="text-sm font-bold text-primary">Human review workspace</p>
        <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Open jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-black">
            {jobs.filter((job) => job.status === "published").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-black">{applications.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average advisory score</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-black">{averageScore}</CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent applications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {applications.slice(0, 5).map((application) => (
            <div
              key={application.id}
              className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold">{application.applicant.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {application.applicant.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{application.status}</Badge>
                <Badge>{application.score?.finalScore ?? "No score"}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
