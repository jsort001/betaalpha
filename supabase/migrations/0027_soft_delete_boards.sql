-- Soft-delete for boards: "delete" now sets deleted_at instead of
-- issuing a real DELETE, so the tasks_board_id_fkey ON DELETE CASCADE
-- never fires and a board's tasks survive being trashed. A previous
-- hard delete (see git history) took every task on the board with it,
-- irreversibly — this is the fix.
--
-- Soft-delete/restore is just an UPDATE, so any linked member can do
-- it via the existing update permission. Permanent deletion is a real
-- DELETE and stays alumni-only, matching other irreversible actions
-- (allowlist management) — replaces the single "for all" policy from
-- 0020 with separate insert/update/delete policies.

alter table public.boards add column deleted_at timestamptz;

drop policy "boards_write_linked" on public.boards;

create policy "boards_insert_linked" on public.boards
  for insert to authenticated
  with check (public.current_user_role() is not null);

create policy "boards_update_linked" on public.boards
  for update to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);

create policy "boards_delete_alumni" on public.boards
  for delete to authenticated
  using (public.current_user_role() = 'alumni');
