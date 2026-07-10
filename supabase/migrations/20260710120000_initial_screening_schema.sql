create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type public.user_role as enum ('admin', 'hr');
create type public.job_status as enum ('draft', 'published', 'closed');
create type public.application_status as enum (
  'submitted',
  'screening',
  'shortlisted',
  'interview',
  'rejected',
  'hired'
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'hr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null,
  status public.job_status not null default 'draft',
  summary text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  education text[] not null default '{}',
  certifications text[] not null default '{}',
  min_years_experience integer not null default 0 check (min_years_experience >= 0),
  weights jsonb not null default '{"semantic":35,"skills":30,"experience":20,"education":10,"certifications":5}'::jsonb,
  requirements_embedding vector(384),
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  status public.application_status not null default 'submitted',
  cover_note text,
  reviewed_by uuid references public.user_profiles(id),
  override_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.parsed_profiles (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  raw_text text not null,
  skills text[] not null default '{}',
  education text[] not null default '{}',
  certifications text[] not null default '{}',
  years_experience integer not null default 0,
  profile_embedding vector(384),
  reviewed_by uuid references public.user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.screening_criteria (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  label text not null,
  category text not null,
  weight numeric not null default 1 check (weight >= 0),
  required boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  semantic_score integer not null check (semantic_score between 0 and 100),
  skills_score integer not null check (skills_score between 0 and 100),
  experience_score integer not null check (experience_score between 0 and 100),
  education_score integer not null check (education_score between 0 and 100),
  certifications_score integer not null check (certifications_score between 0 and 100),
  rule_based_score integer not null check (rule_based_score between 0 and 100),
  final_score integer not null check (final_score between 0 and 100),
  matched_requirements text[] not null default '{}',
  weak_areas text[] not null default '{}',
  explanation text not null,
  created_at timestamptz not null default now()
);

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status public.application_status,
  to_status public.application_status not null,
  changed_by uuid references public.user_profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  actor_id uuid references public.user_profiles(id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index jobs_status_idx on public.jobs(status);
create index jobs_requirements_embedding_idx on public.jobs using ivfflat (requirements_embedding vector_cosine_ops);
create index parsed_profiles_profile_embedding_idx on public.parsed_profiles using ivfflat (profile_embedding vector_cosine_ops);
create index applications_job_status_idx on public.applications(job_id, status);
create index scores_final_score_idx on public.scores(final_score desc);
create index audit_logs_application_idx on public.audit_logs(application_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.is_hr()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role in ('admin', 'hr')
  );
$$;

alter table public.user_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applicants enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.parsed_profiles enable row level security;
alter table public.screening_criteria enable row level security;
alter table public.scores enable row level security;
alter table public.status_history enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their own profile"
on public.user_profiles for select
using (id = auth.uid() or public.is_hr());

create policy "HR can manage user profiles"
on public.user_profiles for all
using (public.is_hr())
with check (public.is_hr());

create policy "Anyone can read published jobs"
on public.jobs for select
using (status = 'published' or public.is_hr());

create policy "HR can manage jobs"
on public.jobs for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read applicants"
on public.applicants for select
using (public.is_hr());

create policy "HR can manage applicants"
on public.applicants for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read applications"
on public.applications for select
using (public.is_hr());

create policy "HR can manage applications"
on public.applications for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read documents"
on public.documents for select
using (public.is_hr());

create policy "HR can manage documents"
on public.documents for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read parsed profiles"
on public.parsed_profiles for select
using (public.is_hr());

create policy "HR can manage parsed profiles"
on public.parsed_profiles for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can manage screening criteria"
on public.screening_criteria for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read scores"
on public.scores for select
using (public.is_hr());

create policy "HR can manage scores"
on public.scores for all
using (public.is_hr())
with check (public.is_hr());

create policy "HR can read status history"
on public.status_history for select
using (public.is_hr());

create policy "HR can insert status history"
on public.status_history for insert
with check (public.is_hr());

create policy "HR can read audit logs"
on public.audit_logs for select
using (public.is_hr());

create policy "HR can insert audit logs"
on public.audit_logs for insert
with check (public.is_hr() or actor_id is null);

insert into storage.buckets (id, name, public)
values ('applicant-cvs', 'applicant-cvs', false)
on conflict (id) do nothing;

create policy "HR can read CV objects"
on storage.objects for select
using (bucket_id = 'applicant-cvs' and public.is_hr());
