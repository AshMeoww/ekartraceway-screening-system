# Implementation Rules

## General

- Keep changes small, reviewable, and aligned with existing patterns.
- Use TypeScript types from `lib/types.ts` when representing domain data.
- Prefer reusable logic in `lib/` for server workflows, scoring, parsing, and Supabase access.
- Prefer reusable UI primitives in `components/ui/` and route-specific components beside their route.
- Avoid adding abstractions until duplication or complexity justifies them.

## Next.js App Router

- Read the matching docs in `node_modules/next/dist/docs/` before changing App Router conventions.
- Use Server Components for pages that load data and Client Components for forms, filters, local state, and browser-only APIs.
- Keep server actions and route handlers responsible for validation, authorization, audit logging, and persistence.
- Avoid leaking server-only environment variables into client files.

## Forms And Validation

- Use Zod for request validation and React Hook Form for interactive forms.
- Surface user-safe errors in the UI.
- Do not expose stack traces, SQL details, storage keys, or service-role failures to applicants.
- Keep applicant and HR validation rules explicit and covered by tests.

## Supabase

- Use migrations for schema, RLS, storage policies, functions, and RPCs.
- Keep the service role key server-only.
- Check authorization on server workflows even when a page is gated.
- Prefer signed URLs for private CV access.
- Record audit logs for application creation, CV upload/parse, score generation, status change, HR override, and job publish changes.

## AI/ML And Documents

- Use direct extraction before OCR.
- Keep OCR optional and bounded by size/page limits.
- Generate embeddings lazily on the server so builds do not depend on model runtime state.
- Persist extraction method/source so HR can see whether a CV was parsed directly or by OCR.
- Keep semantic scores explainable alongside rule-based scores.

## UI And UX

- Build the usable workflow first; avoid decorative landing-page patterns inside app dashboards.
- Use clear empty, loading, success, and error states.
- Make dashboard controls compact and scannable.
- Keep advisory-scoring language visible near score outputs.
- Verify important pages at desktop and mobile widths when UI changes are substantial.

## Tests

- Unit tests cover scoring, validation, parsing decisions, status transitions, and ranking.
- Integration tests cover server workflows, Supabase metadata creation, scores, audit logs, and authorization.
- E2E tests cover public jobs, applicant apply screens, HR auth guard, HR application review table, and HR score explanations.
- Prefer deterministic test fixtures and avoid real private applicant data.

## Before Final Handoff

- Run the most relevant checks and report their results.
- Mention migrations that must be applied manually.
- Mention environment variables or dashboard setup needed to test.
- Note any checks that could not run and why.
