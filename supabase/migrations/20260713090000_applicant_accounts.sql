alter table public.applicants
add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists applicants_user_id_idx
on public.applicants(user_id);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applicants'
      and policyname = 'Applicants can read their own applicant profile'
  ) then
    create policy "Applicants can read their own applicant profile"
    on public.applicants for select
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'Applicants can read their own applications'
  ) then
    create policy "Applicants can read their own applications"
    on public.applications for select
    using (
      exists (
        select 1
        from public.applicants
        where applicants.id = applications.applicant_id
          and applicants.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'jobs'
      and policyname = 'Applicants can read jobs they applied to'
  ) then
    create policy "Applicants can read jobs they applied to"
    on public.jobs for select
    using (
      exists (
        select 1
        from public.applications
        join public.applicants on applicants.id = applications.applicant_id
        where applications.job_id = jobs.id
          and applicants.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scores'
      and policyname = 'Applicants can read their own scores'
  ) then
    create policy "Applicants can read their own scores"
    on public.scores for select
    using (
      exists (
        select 1
        from public.applications
        join public.applicants on applicants.id = applications.applicant_id
        where applications.id = scores.application_id
          and applicants.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'documents'
      and policyname = 'Applicants can read their own document metadata'
  ) then
    create policy "Applicants can read their own document metadata"
    on public.documents for select
    using (
      exists (
        select 1
        from public.applications
        join public.applicants on applicants.id = applications.applicant_id
        where applications.id = documents.application_id
          and applicants.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'parsed_profiles'
      and policyname = 'Applicants can read their own parsed profile'
  ) then
    create policy "Applicants can read their own parsed profile"
    on public.parsed_profiles for select
    using (
      exists (
        select 1
        from public.applications
        join public.applicants on applicants.id = applications.applicant_id
        where applications.id = parsed_profiles.application_id
          and applicants.user_id = auth.uid()
      )
    );
  end if;
end
$$;
