-- Lets a task be assigned to the whole chapter instead of one person,
-- via a new "Everyone" option in the Owner dropdown.

alter table public.tasks add column assigned_to_everyone boolean not null default false;

-- A task has at most one assignment target: an individual (owner_id or
-- pending_owner_email) or everyone, never both at once.
alter table public.tasks add constraint tasks_single_assignment_target check (
  not assigned_to_everyone or (owner_id is null and pending_owner_email is null)
);
