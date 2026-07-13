do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'status_history'
      and policyname = 'Applicants can read their own status history'
  ) then
    create policy "Applicants can read their own status history"
    on public.status_history for select
    using (
      exists (
        select 1
        from public.applications
        join public.applicants on applicants.id = applications.applicant_id
        where applications.id = status_history.application_id
          and applicants.user_id = auth.uid()
      )
    );
  end if;
end
$$;

notify pgrst, 'reload schema';
