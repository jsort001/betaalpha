-- Exec Board was originally open to any signed-in member, like
-- Contacts. Restrict editing to alumni, matching the pattern used
-- for boards/tasks/allowlist -- undergrads can still view it.

drop policy if exists "exec_board_write_linked" on public.exec_board;

create policy "exec_board_write_alumni" on public.exec_board
  for all to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');
