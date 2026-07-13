# E-Kart Raceway Applicant Screening

AI/ML-assisted applicant screening MVP for E-Kart Raceway. The app helps HR
publish roles, accept applications, parse CV text, generate explainable advisory
scores, rank applicants, and track review decisions with audit logs.

The system does not make hiring decisions. HR remains responsible for every
final decision.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Storage, RLS
- Local ML-lite text similarity and weighted scoring
- React Hook Form, Zod, TanStack Table
- Vitest and Playwright

## Environment

Copy `.env.example` to `.env.local` and fill the Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
APP_BASE_URL=http://localhost:3000
FIRST_ADMIN_EMAIL=
```

Use either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the older
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never commit `.env.local`. Keep
`SUPABASE_SERVICE_ROLE_KEY` server-only.

## Supabase Setup

1. Create a Supabase project.
2. Create a private Storage bucket named `applicant-cvs`.
3. Enable the `vector` extension.
4. Apply migrations in `supabase/migrations`.
5. Create the first auth user and add a matching `user_profiles` row with role
   `admin` or `hr`.

## Development

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm build
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` product entry
- `/jobs` public job listing
- `/jobs/[slug]` public job detail
- `/jobs/[slug]/apply` applicant form and CV upload
- `/login` HR login
- `/hr` HR dashboard
- `/hr/jobs` HR job management surface
- `/hr/applications` applicant ranking table
- `/hr/applications/[id]` applicant review and status update

## Branch Workflow

Use:

- `main` for stable production
- `develop` for active development
- `feature/*` for scoped feature work
- `fix/*`, `hotfix/*`, and `release/*` as needed

Current scaffold branch: `feature/project-scaffold`.
