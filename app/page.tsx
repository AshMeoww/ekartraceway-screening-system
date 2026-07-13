import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const capabilities = [
  {
    title: "Public applications",
    description: "Publish open roles and collect structured applicant data with CV files.",
    icon: ClipboardCheck,
  },
  {
    title: "Explainable screening",
    description: "Combine local text similarity with weighted rules for advisory scores.",
    icon: FileSearch,
  },
  {
    title: "Human HR control",
    description: "Keep status changes, overrides, and audit history visible to reviewers.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
                EK
              </span>
              <span>E-Kart Raceway Screening</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground sm:flex">
              <Link href="/jobs" className="hover:text-foreground">
                Jobs
              </Link>
              <Link href="/auth/login" className="hover:text-foreground">
                Sign in
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_0.86fr]">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-md border border-border bg-card px-3 py-2 text-sm font-bold text-primary">
                Advisory applicant screening
              </p>
              <h1 className="text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
                Review applicants faster without removing human judgment.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                A small enterprise-ready MVP for publishing roles, accepting CVs,
                extracting applicant data, and generating explainable screening
                scores for HR review.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/jobs">
                    View open roles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/auth/login">Sign in or create account</Link>
                </Button>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                Scores are advisory only. HR remains responsible for all hiring
                decisions and can inspect, override, or reject generated outputs.
              </p>
            </div>

            <div className="grid gap-4">
              {capabilities.map((capability) => {
                const Icon = capability.icon;

                return (
                  <Card key={capability.title}>
                    <CardHeader className="flex-row items-center gap-4">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <CardTitle>{capability.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-7 text-muted-foreground">
                        {capability.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
