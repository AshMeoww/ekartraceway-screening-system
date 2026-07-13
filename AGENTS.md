<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# E-Kart Raceway Screening System Agent Guide

This file is the shared operating guide for AI agents and maintainers working in this repository. Keep it practical, current, and biased toward safe implementation.

## Product Context

- This is a Next.js 16 App Router MVP for an AI/ML-assisted applicant screening system.
- The system supports public job discovery, applicant accounts, saved applications, private CV upload/parsing, HR review, explainable advisory scoring, and audit trails.
- AI/ML scores are review aids only. Never describe a score as a final hiring decision, automatic rejection, or replacement for HR judgment.
- Product context lives in `docs/agent/project-context.md`.

## Next.js 16 Rules

- Read the relevant file-convention or API docs in `node_modules/next/dist/docs/` before changing App Router routes, layouts, route handlers, server actions, metadata, middleware/proxy, or caching behavior.
- Prefer Server Components for data-loading pages. Use Client Components only for interactivity, form state, filters, or browser APIs.
- Treat `params` and `searchParams` as promises in App Router pages/layouts.
- Keep privileged Supabase and filesystem work on the server side.

## Branch And Commit Workflow

- `main` is the stable portfolio branch.
- `develop` is the integration branch.
- Feature work should happen on `feature/<short-name>` branches unless a user asks for a different branch name.
- Use conventional commits, for example `feat(auth): add applicant sign in`, `fix(cv): normalize storage keys`, or `docs(qa): add reviewer rubric`.
- Before merging a feature branch, sync from `develop`, resolve conflicts intentionally, and rerun the verification ladder below.

## Supabase Safety

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components, browser bundles, logs, screenshots, or committed files.
- Public browser code may use only publishable/anon Supabase keys.
- Keep RLS enabled on application tables and add policies through migrations.
- Store applicant CVs in the private `applicant-cvs` bucket and serve them through signed URLs only.
- Use migrations for schema changes. Document any manual Supabase dashboard setup in the PR.
- Do not commit `.env.local`, real credentials, private applicant data, or downloaded CVs.

## AI/ML And Scoring Rules

- Use direct PDF/DOCX extraction first, OCR fallback only when needed, and local embeddings for semantic matching.
- Store explainable scoring outputs: semantic fit, skills, experience, education, certifications, matched requirements, weak areas, final score, and explanation.
- UI copy must say the score is advisory and HR makes the final hiring decision.
- Avoid black-box behavior. If a score is shown, show why.

## Verification Ladder

Run the smallest useful check while developing, then climb the ladder before final handoff:

1. Targeted unit or integration tests for touched logic.
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test:unit`
5. `pnpm test:integration`
6. `pnpm build`
7. `pnpm qa` for the standard full local QA pass.
8. `pnpm qa:e2e` when routes, auth, forms, dashboards, or review UX changed.

If a check cannot run locally, explain why and name the remaining risk.

## QA Reviewer Workflow

- Use `docs/qa/qa-reviewer.md` after each feature branch reaches a reviewable state.
- Run automated checks first, browser smoke tests second, and the QA rubric third.
- Fix only actionable issues. Log nice-to-have polish separately.
- Keep screenshot references in `docs/design/screenshots/` when a UI state becomes approved.

## Implementation Rules

- Follow `docs/agent/implementation-rules.md` for coding patterns and file ownership.
- Follow `docs/design/design-reference.md` for visual and UX expectations.
- Use `pnpm`, not npm, for dependency and script commands.
- Keep edits scoped to the requested feature.
- Do not revert user work unless the user explicitly asks.
