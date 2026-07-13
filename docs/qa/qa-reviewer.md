# QA Reviewer Rubric

Use this rubric after a feature branch reaches a reviewable state. Run automated checks first, browser smoke tests second, and this review third.

## Reviewer Role

Act as a practical QA tester for an HR applicant screening MVP. Critique the feature for product quality, user trust, data safety, and portfolio polish. Prefer actionable findings over broad opinions.

## Inputs To Review

- Feature summary and acceptance criteria.
- Changed files or PR diff.
- Local app URL and tested routes.
- Relevant screenshots or screen recordings.
- Test output from `pnpm qa` and, when applicable, `pnpm qa:e2e`.
- Supabase migrations or dashboard setup notes.

## Review Checklist

- Visual hierarchy: important actions, statuses, and score signals are easy to scan.
- Layout: desktop and mobile views avoid overlap, cramped controls, and clipped text.
- Copy: labels are specific, errors are user-safe, and empty states explain what to do next.
- Auth: public, applicant, and HR/admin routes enforce the correct access rules.
- Supabase: migrations, RLS policies, storage privacy, and signed URL behavior match the feature.
- AI/ML: scores are explainable, advisory-only, and never framed as final hiring decisions.
- Performance: OCR, embedding generation, parsing, and dashboard queries have reasonable bounds.
- Data safety: no service-role key, private CV, applicant PII, or local secrets are exposed.
- Functionality: primary happy path and likely failure paths behave correctly.
- Tests: coverage matches the risk of the change, and acceptance-critical behavior is automated where practical.

## Severity Labels

- P0: Blocks release or exposes private data/secrets.
- P1: Breaks a core workflow, authorization rule, migration, or scoring trust requirement.
- P2: Noticeable UX, reliability, or test gap that should be fixed before merge.
- P3: Polish, copy, or maintainability improvement that can be deferred.

## Output Format

Start with findings, ordered by severity:

```md
## Findings

- [P1] Short title - file or route
  Evidence: what was observed.
  Impact: why it matters.
  Recommendation: concrete fix.

## Tested

- `pnpm qa`
- Browser: `/jobs`, `/hr/applications`

## Residual Risk

- Note any untested auth state, migration, or browser/device.
```

If no issues are found, say that clearly and still list any residual test gaps.

## Non-Goals

- Do not demand heavy visual-regression tooling for every small change.
- Do not rewrite working implementation style without a user-visible benefit.
- Do not suggest paid AI APIs for v1 unless the user explicitly changes the constraint.
