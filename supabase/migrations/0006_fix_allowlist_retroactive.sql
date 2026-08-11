-- The allowlist-gated signup trigger previously only ran on a
-- Google account's *first ever* auth.users insert. If someone
-- signed in once before being added to the allowlist, that row
-- already existed, so adding them afterward never re-triggered
-- the check and they stayed locked out permanently.
--
-- Fix: also fire on auth.users update (Supabase updates that row
-- on every sign-in), guarded with ON CONFLICT so it's a no-op for
-- members already linked. This makes allowlist additions retroactive.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  match record;
begin
  select name, assigned_role into match
  from public.allowlist
  where email = new.email;

  if found then
    insert into public.users (id, email, name, role)
    values (new.id, new.email, match.name, match.assigned_role)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();
