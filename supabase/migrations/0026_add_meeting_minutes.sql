-- Minutes for biweekly chapter meetings. Same permission pattern as
-- boards/tasks/events: any linked member can view and manage them.

create table public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  title text not null,
  body text not null,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create index meeting_minutes_date_idx on public.meeting_minutes (meeting_date);

alter table public.meeting_minutes enable row level security;

create policy "meeting_minutes_select_linked" on public.meeting_minutes
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "meeting_minutes_write_linked" on public.meeting_minutes
  for all to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);
