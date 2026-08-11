-- Resources > Exec Board: current undergrad officers and their
-- positions. Same open-editing model as contacts -- any signed-in
-- member can manage this, not just alumni.

create table public.exec_board (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  created_at timestamptz not null default now()
);

alter table public.exec_board enable row level security;

create policy "exec_board_select_linked" on public.exec_board
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "exec_board_write_linked" on public.exec_board
  for all to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);

-- Placeholder roster until real undergrad names are added.
insert into public.exec_board (name, position) values
  ('Jordan Smith', 'President'),
  ('Casey Wilson', 'Vice President'),
  ('Alex Johnson', 'Treasurer'),
  ('Morgan Davis', 'PR'),
  ('Taylor Brown', 'Community Service Chair');
