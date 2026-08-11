-- A stray trailing space in an allowlist email silently breaks the
-- exact-match lookup in handle_new_user() against the real Google
-- email, permanently locking that person out with no visible error.
-- The app's Allowlist page already trims input, but this guarantees
-- correctness regardless of entry path (dashboard table editor, SQL,
-- future code paths).

create or replace function public.normalize_allowlist_email()
returns trigger
language plpgsql
as $$
begin
  new.email = lower(trim(new.email));
  return new;
end;
$$;

create trigger allowlist_normalize_email
  before insert or update on public.allowlist
  for each row execute function public.normalize_allowlist_email();
