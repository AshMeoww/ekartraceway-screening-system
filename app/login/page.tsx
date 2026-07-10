import Link from "next/link";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const errorCopy: Record<string, string> = {
  "supabase-not-configured":
    "Supabase is not configured yet. Fill .env.local with the required project values.",
  "invalid-credentials": "The email or password was not accepted.",
};

export const metadata = {
  title: "HR Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>HR login</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with a Supabase user that has an admin or HR profile.
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {errorCopy[error] ?? "Unable to sign in."}
            </p>
          ) : null}
          <form action={signIn} className="grid gap-5">
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
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
