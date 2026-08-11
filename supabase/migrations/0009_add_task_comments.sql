-- Task comments, with structured member tagging so a future
-- notify-on-tag feature has clean data to work from (no text
-- parsing needed at notification time).

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.users (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.comment_mentions (
  comment_id uuid not null references public.task_comments (id) on delete cascade,
  user_id uuid not null references public.users (id),
  primary key (comment_id, user_id)
);

create index task_comments_task_id_idx on public.task_comments (task_id);
create index comment_mentions_user_id_idx on public.comment_mentions (user_id);

alter table public.task_comments enable row level security;
alter table public.comment_mentions enable row level security;

-- comments: any linked member can read all comments; can post their
-- own (author_id must match the caller); can delete their own, and
-- alumni can delete any (moderation). No edit -- keeps the thread's
-- history straightforward.
create policy "task_comments_select_linked" on public.task_comments
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "task_comments_insert_own" on public.task_comments
  for insert to authenticated
  with check (public.current_user_role() is not null and author_id = auth.uid());

create policy "task_comments_delete_own_or_alumni" on public.task_comments
  for delete to authenticated
  using (author_id = auth.uid() or public.current_user_role() = 'alumni');

-- mentions: readable by any linked member; a caller may only attach
-- mentions to a comment they themselves just authored.
create policy "comment_mentions_select_linked" on public.comment_mentions
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "comment_mentions_insert_own_comment" on public.comment_mentions
  for insert to authenticated
  with check (
    exists (
      select 1 from public.task_comments c
      where c.id = comment_id and c.author_id = auth.uid()
    )
  );
