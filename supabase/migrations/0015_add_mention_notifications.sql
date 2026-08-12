-- Dedup tracking for "you were tagged in a comment" notifications,
-- same pattern as the *_notified_at columns on tasks.

alter table public.comment_mentions
  add column notified_at timestamptz;
