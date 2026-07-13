create or replace function public.match_parsed_profiles(
  query_embedding extensions.vector(384),
  match_threshold float default 0,
  match_count int default 20
)
returns table (
  application_id uuid,
  similarity float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    parsed_profiles.application_id,
    1 - (parsed_profiles.profile_embedding OPERATOR(extensions.<=>) query_embedding) as similarity
  from public.parsed_profiles
  where public.is_hr()
    and parsed_profiles.profile_embedding is not null
    and 1 - (parsed_profiles.profile_embedding OPERATOR(extensions.<=>) query_embedding) > match_threshold
  order by parsed_profiles.profile_embedding OPERATOR(extensions.<=>) query_embedding asc
  limit match_count;
$$;

create or replace function public.match_applications_for_job(
  target_job_id uuid,
  match_threshold float default 0,
  match_count int default 20
)
returns table (
  application_id uuid,
  similarity float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    parsed_profiles.application_id,
    1 - (parsed_profiles.profile_embedding OPERATOR(extensions.<=>) jobs.requirements_embedding) as similarity
  from public.jobs
  join public.applications on applications.job_id = jobs.id
  join public.parsed_profiles on parsed_profiles.application_id = applications.id
  where public.is_hr()
    and jobs.id = target_job_id
    and jobs.requirements_embedding is not null
    and parsed_profiles.profile_embedding is not null
    and 1 - (parsed_profiles.profile_embedding OPERATOR(extensions.<=>) jobs.requirements_embedding) > match_threshold
  order by parsed_profiles.profile_embedding OPERATOR(extensions.<=>) jobs.requirements_embedding asc
  limit match_count;
$$;

grant execute on function public.match_parsed_profiles(extensions.vector(384), float, int) to authenticated;
grant execute on function public.match_applications_for_job(uuid, float, int) to authenticated;
