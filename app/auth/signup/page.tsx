import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpApplicant } from "../actions";

const errorCopy: Record<string, string> = {
  "supabase-not-configured": "Supabase is not configured yet.",
  "password-too-short": "Use at least 8 characters for your password.",
  "password-mismatch": "Passwords do not match.",
};

export const metadata = {
  title: "Applicant Signup",
};

export default async function ApplicantSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create applicant account</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Save applications and return later to see their review status.
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {errorCopy[error] ?? error}
            </p>
          ) : null}
          <form action={signUpApplicant} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <Button type="submit">Create account</Button>
          </form>
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/auth/login">I already have an account</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
