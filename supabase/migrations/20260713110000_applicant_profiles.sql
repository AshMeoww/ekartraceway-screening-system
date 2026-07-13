create table if not exists public.applicant_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  headline text,
  location text,
  years_experience integer not null default 0 check (years_experience >= 0 and years_experience <= 60),
  skills text[] not null default '{}',
  education text[] not null default '{}',
  certifications text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applicant_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_applicant_profiles_updated_at'
      and tgrelid = 'public.applicant_profiles'::regclass
  ) then
    create trigger set_applicant_profiles_updated_at
    before update on public.applicant_profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applicant_profiles'
      and policyname = 'Applicants can read their own profile'
  ) then
    create policy "Applicants can read their own profile"
    on public.applicant_profiles for select
    using (id = auth.uid() or public.is_hr());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applicant_profiles'
      and policyname = 'Applicants can create their own profile'
  ) then
    create policy "Applicants can create their own profile"
    on public.applicant_profiles for insert
    with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'applicant_profiles'
      and policyname = 'Applicants can update their own profile'
  ) then
    create policy "Applicants can update their own profile"
    on public.applicant_profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());
  end if;
end
$$;

notify pgrst, 'reload schema';
