# Project Context

## Product Goal

E-Kart Raceway Screening System is a portfolio-ready MVP for HR-assisted applicant screening. It helps applicants find roles, submit applications, upload CVs, and track saved applications. It helps HR review applicants with explainable advisory scores, parsed CV details, and audit-friendly status changes.

The product must make HR faster without pretending to make final hiring decisions.

## User Groups

- Public visitor: browses published jobs and can start an application.
- Applicant: signs up or signs in, submits applications, uploads CVs, and views saved applications/profile data.
- HR/admin: signs in through Supabase Auth, manages jobs, reviews applications, changes statuses, and inspects scoring explanations.

## Route Map

- Public: `/`, `/jobs`, `/jobs/[slug]`, `/jobs/[slug]/apply`
- Auth: `/auth/login`, `/auth/signup`, `/auth/callback`, `/login`
- Applicant account: `/account/profile`, `/account/applications`, `/account/applications/[id]`
- HR: `/hr`, `/hr/jobs`, `/hr/applications`, `/hr/applications/[id]`
- API and route handlers: application submission, OAuth callback/session flow, private document signed URLs

## Data Model

Core Supabase tables include:

- `user_profiles`: auth-linked role and profile metadata.
- `jobs`: job details, publishing state, screening criteria, and requirement embeddings.
- `applicants`: applicant identity and contact information.
- `applicant_profiles`: applicant-owned profile details.
- `applications`: submitted applications, status, cover note, and job link.
- `documents`: private CV metadata and storage object keys.
- `parsed_profiles`: extracted CV/profile text, skills, experience, education, certifications, extraction metadata, and profile embeddings.
- `screening_criteria`: per-job weights and requirements.
- `scores`: advisory scoring breakdown, matched requirements, weak areas, and explanation.
- `status_history`: status transitions and HR override reasons.
- `audit_logs`: important system and HR events.

## AI/ML Pipeline

1. Extract direct text from PDF/DOCX when possible.
2. Use OCR fallback for scanned PDFs or image uploads when direct text is missing or too short.
3. Generate local 384-dimensional embeddings with Transformers.js.
4. Store vectors in Supabase pgvector columns.
5. Score semantic fit with cosine similarity and combine it with rule-based scoring.
6. Show explainable, advisory-only results to HR.

## Key Assumptions

- Single-company system for v1.
- No paid AI APIs or external inference calls in v1.
- Supabase credentials, Google OAuth, pgvector, and the private `applicant-cvs` bucket are configured manually.
- HR makes every final hiring decision.
- Email notifications, analytics, exports, SSO, custom model training, and multi-tenant support are deferred.
