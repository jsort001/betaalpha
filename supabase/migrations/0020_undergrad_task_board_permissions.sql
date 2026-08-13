-- Chapter decision: undergrads now get the same task/board
-- permissions as alumni — create, edit, delete boards and tasks,
-- and assign/reassign anyone (not just tasks they own). Allowlist
-- and user-role management remain alumni-only; those policies are
-- untouched.

drop policy "boards_write_alumni" on public.boards;
create policy "boards_write_linked" on public.boards
  for all to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);

drop policy "tasks_insert_alumni" on public.tasks;
create policy "tasks_insert_linked" on public.tasks
  for insert to authenticated
  with check (public.current_user_role() is not null);

drop policy "tasks_delete_alumni" on public.tasks;
create policy "tasks_delete_linked" on public.tasks
  for delete to authenticated
  using (public.current_user_role() is not null);

drop policy "tasks_update_alumni_or_owner" on public.tasks;
create policy "tasks_update_linked" on public.tasks
  for update to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);

-- This trigger's whole job was restricting undergrads to changing
-- only the status column on tasks they owned. That restriction no
-- longer applies to anyone, so the trigger is now a no-op — drop it
-- rather than leave dead code in the write path.
drop trigger if exists tasks_enforce_update_permissions on public.tasks;
drop function if exists public.enforce_task_update_permissions();
