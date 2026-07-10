import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrJobs } from "@/lib/data";
import { setJobStatus } from "./actions";
import { JobForm } from "./job-form";

export const metadata = {
  title: "HR Jobs",
};

export default async function HrJobsPage() {
  const jobs = await getHrJobs();

  return (
    <main>
      <div className="mb-8">
        <p className="text-sm font-bold text-primary">Job management</p>
        <h1 className="mt-2 text-3xl font-black">Jobs</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Create roles, tune screening weights, and publish or unpublish public
          job listings. HR decisions stay advisory and review-led.
        </p>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm />
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{job.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {job.department} - {job.location}
                </p>
              </div>
              <Badge variant={job.status === "published" ? "success" : "secondary"}>
                {job.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="leading-7 text-muted-foreground">{job.summary}</p>
              <div className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-5">
                <Metric label="Semantic" value={job.weights.semantic} />
                <Metric label="Skills" value={job.weights.skills} />
                <Metric label="Experience" value={job.weights.experience} />
                <Metric label="Education" value={job.weights.education} />
                <Metric label="Certs" value={job.weights.certifications} />
              </div>
              <form action={setJobStatus} className="flex justify-end">
                <input type="hidden" name="jobId" value={job.id} />
                <input
                  type="hidden"
                  name="status"
                  value={job.status === "published" ? "draft" : "published"}
                />
                <Button type="submit" variant="secondary" size="sm">
                  {job.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black">{value}%</p>
    </div>
  );
}
