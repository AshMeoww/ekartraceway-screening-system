import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

const navItems = [
  ["Dashboard", "/hr"],
  ["Jobs", "/hr/jobs"],
  ["Applications", "/hr/applications"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/hr" className="flex items-center gap-3 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
              EK
            </span>
            <span>Screening HR</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map(([label, href]) => (
              <Button asChild key={href} variant="ghost" size="sm">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
