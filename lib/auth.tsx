import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentHrUser, isSupabaseConfigured } from "@/lib/supabase/server";

export async function HrGate({ children }: { children: React.ReactNode }) {
  const hrUser = await getCurrentHrUser();

  if (!hrUser) {
    return (
      <main className="min-h-screen bg-background px-5 py-16 text-foreground">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <CardTitle>HR access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-7 text-muted-foreground">
              This workspace contains applicant data and requires a Supabase HR
              session. Configure Supabase and sign in with an HR or admin profile
              to continue.
            </p>
            {!isSupabaseConfigured() ? (
              <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                Supabase environment variables are not configured yet. Copy
                .env.example to .env.local and fill in the project values.
              </p>
            ) : null}
            <Button asChild>
              <Link href="/login">Go to HR login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
