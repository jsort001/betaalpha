-- Comments could previously only be posted or deleted; allow the
-- author to edit their own comment's text after posting. Scoped to
-- the author only (unlike delete, which alumni can also do for
-- moderation) since rewriting someone else's words is different
-- from removing them.

create policy "task_comments_update_own" on public.task_comments
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
