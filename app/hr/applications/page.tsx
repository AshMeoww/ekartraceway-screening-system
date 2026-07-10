import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHrApplications } from "@/lib/data";
import { ApplicationsTable } from "./applications-table";

export const metadata = {
  title: "HR Applications",
};

export default async function HrApplicationsPage() {
  const applications = await getHrApplications();

  return (
    <main>
      <div className="mb-8">
        <p className="text-sm font-bold text-primary">Applicant review</p>
        <h1 className="mt-2 text-3xl font-black">Applications</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ranked applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationsTable applications={applications} />
        </CardContent>
      </Card>
    </main>
  );
}
