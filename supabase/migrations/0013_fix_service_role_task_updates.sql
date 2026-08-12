-- enforce_task_update_permissions() rejected every update made by a
-- trusted backend context (migrations, the service-role
-- send-task-notifications Edge Function) because auth.uid() is null
-- there, and the old check treated "no auth.uid()" as "not the
-- owner" rather than "not a regular user at all". RLS already gates
-- what's reachable via the public API; this trigger only needs to
-- constrain undergrads acting through the app itself, so trust any
-- context with no authenticated user.

create or replace function public.enforce_task_update_permissions()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

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
    or new.due_date is distinct from old.due_date
    or new.priority is distinct from old.priority
    or new.recurrence_rule is distinct from old.recurrence_rule
  then
    raise exception 'Undergrad members may only change task status';
  end if;

  return new;
end;
$$;
