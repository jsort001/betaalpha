-- Chapter decision: undergrads can now create/edit/delete calendar
-- events too, matching the boards/tasks permission opening in 0020.
-- Only the calendar feed's subscribe-token regeneration (a separate
-- concern, unrelated to this table) stays alumni-only.

drop policy "events_write_alumni" on public.events;
create policy "events_write_linked" on public.events
  for all to authenticated
  using (public.current_user_role() is not null)
  with check (public.current_user_role() is not null);
