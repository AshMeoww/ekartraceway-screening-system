import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInApplicant } from "../actions";

const errorCopy: Record<string, string> = {
  "supabase-not-configured": "Supabase is not configured yet.",
  "invalid-credentials": "The email or password was not accepted.",
};

const messageCopy: Record<string, string> = {
  "check-email": "Check your email to confirm your account before signing in.",
};

export const metadata = {
  title: "Applicant Login",
};

export default async function ApplicantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Applicant login</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in to save applications and track review progress.
          </p>
        </CardHeader>
        <CardContent>
          {message ? (
            <p className="mb-5 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
              {messageCopy[message] ?? message}
            </p>
          ) : null}
          {error ? (
            <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {errorCopy[error] ?? error}
            </p>
          ) : null}
          <form action={signInApplicant} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit">Sign in</Button>
          </form>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="secondary">
              <Link href="/auth/signup">Create applicant account</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
