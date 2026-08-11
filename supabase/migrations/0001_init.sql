-- Beta Alpha chapter task manager: initial schema, RLS, and triggers.
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- ============================================================
-- Tables
-- ============================================================

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('undergrad', 'alumni')),
  created_at timestamptz not null default now()
);

create table public.allowlist (
  email text primary key,
  name text not null,
  assigned_role text not null check (assigned_role in ('undergrad', 'alumni'))
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  description text,
  owner_id uuid references public.users (id) on delete set null,
  due_date date,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'done', 'blocked')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  recurrence_rule text
    check (recurrence_rule in ('weekly', 'monthly', 'semester')),
  created_by uuid not null references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deliberately no FK on task_id: history must survive the task being deleted.
create table public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  changed_by uuid references public.users (id),
  change_type text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index tasks_board_id_idx on public.tasks (board_id);
create index tasks_owner_id_idx on public.tasks (owner_id);
create index tasks_due_date_idx on public.tasks (due_date);
create index task_history_task_id_idx on public.task_history (task_id);

insert into public.boards (name, description) values
  ('Officer Duties', 'Standing responsibilities for chapter officers'),
  ('New Member Requirements', 'Tasks and milestones for new members'),
  ('Events & Philanthropy', 'Event planning and philanthropy tasks'),
  ('Risk & Compliance', 'Risk management and compliance deadlines');

-- ============================================================
-- Helper: current user's role, bypassing RLS (owned by table owner).
-- Used inside policies to avoid recursive RLS checks on public.users.
-- ============================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ============================================================
-- Allowlist-gated signup: runs after Supabase Auth creates the
-- auth.users row. If the email matches the allowlist, mirror it
-- into public.users with the assigned role; otherwise do nothing
-- (no public.users row => app shows "not authorized").
-- ============================================================

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
    values (new.id, new.email, match.name, match.assigned_role);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Undergrads may only change `status` on tasks they own. Alumni
-- may change anything. RLS (below) gates *which rows* an update
-- can touch; this trigger gates *which columns*.
-- ============================================================

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
    or new.due_date is distinct from old.due_date
    or new.priority is distinct from old.priority
    or new.recurrence_rule is distinct from old.recurrence_rule
  then
    raise exception 'Undergrad members may only change task status';
  end if;

  return new;
end;
$$;

create trigger tasks_enforce_update_permissions
  before update on public.tasks
  for each row execute function public.enforce_task_update_permissions();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- Recurrence: when a recurring task is marked done, clone it into
-- a fresh not_started task with the due date advanced by the rule.
-- Runs as table owner (security definer) so it works regardless of
-- whether the completing user is normally allowed to insert tasks.
-- ============================================================

create or replace function public.regenerate_recurring_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_due date;
begin
  if new.status = 'done'
    and old.status is distinct from 'done'
    and new.recurrence_rule is not null
  then
    next_due := (
      case new.recurrence_rule
        when 'weekly' then coalesce(old.due_date, current_date) + interval '7 days'
        when 'monthly' then coalesce(old.due_date, current_date) + interval '1 month'
        when 'semester' then coalesce(old.due_date, current_date) + interval '6 months'
      end
    )::date;

    insert into public.tasks (
      board_id, title, description, owner_id, due_date,
      status, priority, recurrence_rule, created_by
    ) values (
      new.board_id, new.title, new.description, new.owner_id, next_due,
      'not_started', new.priority, new.recurrence_rule, new.created_by
    );
  end if;

  return new;
end;
$$;

create trigger tasks_regenerate_recurring
  after update on public.tasks
  for each row execute function public.regenerate_recurring_task();

-- ============================================================
-- Audit trail: every insert/update/delete on tasks writes a row
-- to task_history. Runs as table owner so it works even though
-- authenticated users have no direct write access to task_history.
-- ============================================================

create or replace function public.log_task_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_history (task_id, changed_by, change_type, details)
    values (new.id, auth.uid(), 'created', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.task_history (task_id, changed_by, change_type, details)
    values (
      new.id,
      auth.uid(),
      case
        when new.status is distinct from old.status then 'status_changed'
        when new.owner_id is distinct from old.owner_id then 'reassigned'
        else 'updated'
      end,
      jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.task_history (task_id, changed_by, change_type, details)
    values (old.id, auth.uid(), 'deleted', to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$;

create trigger tasks_log_history
  after insert or update or delete on public.tasks
  for each row execute function public.log_task_history();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;
alter table public.allowlist enable row level security;
alter table public.boards enable row level security;
alter table public.tasks enable row level security;
alter table public.task_history enable row level security;

-- users: any linked (allowlisted) member can see the roster;
-- only alumni can create/edit/delete user rows (role changes).
create policy "users_select_linked" on public.users
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "users_write_alumni" on public.users
  for all to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');

-- allowlist: alumni only, in and out.
create policy "allowlist_alumni_only" on public.allowlist
  for all to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');

-- boards: any linked member can view; only alumni manage boards.
create policy "boards_select_linked" on public.boards
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "boards_write_alumni" on public.boards
  for all to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');

-- tasks: any linked member can view every board's tasks.
create policy "tasks_select_linked" on public.tasks
  for select to authenticated
  using (public.current_user_role() is not null);

-- only alumni create or delete tasks.
create policy "tasks_insert_alumni" on public.tasks
  for insert to authenticated
  with check (public.current_user_role() = 'alumni');

create policy "tasks_delete_alumni" on public.tasks
  for delete to authenticated
  using (public.current_user_role() = 'alumni');

-- alumni can update any task; undergrads can update only tasks they
-- own (the enforce_task_update_permissions trigger further limits
-- undergrads to changing just the status column).
create policy "tasks_update_alumni_or_owner" on public.tasks
  for update to authenticated
  using (public.current_user_role() = 'alumni' or owner_id = auth.uid())
  with check (public.current_user_role() = 'alumni' or owner_id = auth.uid());

-- task_history: readable by any linked member; no direct writes
-- (only the security-definer trigger above writes to it).
create policy "task_history_select_linked" on public.task_history
  for select to authenticated
  using (public.current_user_role() is not null);
