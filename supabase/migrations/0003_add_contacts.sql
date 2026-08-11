-- Resources > Contacts: a shared contact directory. Any signed-in
-- member (undergrad or alumni) can view, add, edit, and delete
-- entries -- unlike boards/tasks/allowlist, this isn't alumni-gated.

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "contacts_select_linked" on public.contacts
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "contacts_write_linked" on public.contacts
  for all to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);
