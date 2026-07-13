import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { saveApplicantProfile } from "@/app/account/profile/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApplicantProfile } from "@/lib/data";

export const metadata = {
  title: "Applicant Profile",
};

function listValue(items: string[]) {
  return items.join("\n");
}

export default async function ApplicantProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const { user, profile, setupError } = await getApplicantProfile();

  if (!user) {
    redirect("/auth/login");
  }

  const defaultFullName =
    profile?.fullName ??
    (typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "");

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-primary">
              E-Kart Raceway Screening
            </Link>
            <h1 className="mt-3 text-3xl font-black">Applicant profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/account/applications">My applications</Link>
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Keep reusable applicant details here. Future application forms can
              use this profile as a starting point.
            </p>
          </CardHeader>
          <CardContent>
            <form action={saveApplicantProfile} className="grid gap-5">
              {saved ? (
                <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
                  Profile saved.
                </p>
              ) : null}
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {setupError ? (
                <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                  {setupError}
                </p>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={defaultFullName}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={profile?.email ?? user.email ?? ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={profile?.phone ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={profile?.location ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    name="headline"
                    placeholder="Customer service associate"
                    defaultValue={profile?.headline ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="yearsExperience">Years of experience</Label>
                  <Input
                    id="yearsExperience"
                    name="yearsExperience"
                    type="number"
                    min="0"
                    max="60"
                    defaultValue={profile?.yearsExperience ?? 0}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    rows={7}
                    placeholder="Customer service&#10;Safety communication"
                    defaultValue={listValue(profile?.skills ?? [])}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    name="education"
                    rows={7}
                    placeholder="Diploma in Hospitality"
                    defaultValue={listValue(profile?.education ?? [])}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    rows={7}
                    placeholder="First aid&#10;Food safety"
                    defaultValue={listValue(profile?.certifications ?? [])}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="justify-self-start"
                disabled={Boolean(setupError)}
              >
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
