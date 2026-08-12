-- Chapter events calendar. Same permission pattern as boards/tasks:
-- alumni manage, everyone views.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  start_date date not null,
  end_date date,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create index events_start_date_idx on public.events (start_date);

alter table public.events enable row level security;

create policy "events_select_linked" on public.events
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "events_write_alumni" on public.events
  for all to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');

insert into public.events (title, description, location, start_date, end_date, created_by)
select
  'LUL National Convention 2027',
  'Academics, Brotherhood, Culture & Service. See launidadlatina.org for details.',
  'Alexandria, Virginia',
  '2027-06-24',
  '2027-06-27',
  (select id from public.users where email = 'jairo.sorto@gmail.com');
