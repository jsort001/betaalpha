-- Lets alumni assign a task to someone on the allowlist who hasn't
-- signed in yet (no public.users row exists for them). The pending
-- assignment resolves to a real owner_id automatically the first
-- time that person signs in.

alter table public.tasks
  add column pending_owner_email text references public.allowlist (email) on delete set null;

alter table public.tasks
  add constraint tasks_owner_or_pending_not_both
  check (owner_id is null or pending_owner_email is null);

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

    update public.tasks
    set owner_id = new.id, pending_owner_email = null
    where pending_owner_email = new.email;
  end if;

  return new;
end;
$$;

-- pending_owner_email is owner-like, so undergrads must be blocked
-- from changing it the same way they're blocked from owner_id.
create or replace function public.enforce_task_update_permissions()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.current_user_role() = 'alumni' then
    return new;
  end if;

  if old.owner_id is distinct from auth.uid() then
    raise exception 'Only the task owner or an alumni can update this task';
  end if;

  if new.board_id is distinct from old.board_id
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.owner_id is distinct from old.owner_id
    or new.pending_owner_email is distinct from old.pending_owner_email
    or new.due_date is distinct from old.due_date
    or new.priority is distinct from old.priority
    or new.recurrence_rule is distinct from old.recurrence_rule
  then
    raise exception 'Undergrad members may only change task status';
  end if;

  return new;
end;
$$;
