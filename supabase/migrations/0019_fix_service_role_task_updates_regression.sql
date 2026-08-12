-- 0018 replaced enforce_task_update_permissions() to also guard the
-- new pending_owner_email column, but dropped the "auth.uid() is
-- null" bypass that 0013 had added for trusted backend contexts
-- (the service-role send-task-notifications Edge Function). Since
-- then, every attempt by that function to stamp a task's
-- *_notified_at column has been rejected with "Only the task owner
-- or an alumni can update this task" — so the dedup write never
-- lands, and the same qualifying tasks get re-emailed and
-- re-posted to Slack on every 15-minute poll instead of once.

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
