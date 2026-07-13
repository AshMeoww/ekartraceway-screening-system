# Screenshot References

Store approved UI references here when a feature reaches a stable visual state.

## Suggested Naming

- `public-jobs-desktop.png`
- `public-jobs-mobile.png`
- `applicant-apply-desktop.png`
- `account-applications-desktop.png`
- `hr-applications-table-desktop.png`
- `hr-application-detail-desktop.png`
- `hr-auth-guard-mobile.png`

## Capture Rules

- Capture both desktop and mobile for major workflow changes.
- Hide or seed fake applicant data before committing screenshots.
- Do not commit real CVs, real applicant PII, access tokens, Supabase keys, or private browser details.
- Prefer screenshots after `pnpm qa:e2e` or a manual browser smoke test.

## Updating References

- Replace a screenshot only when the visual change is intentional.
- Mention updated screenshots in the PR checklist.
- If a screenshot exposes private data, remove it from git history before publishing.
