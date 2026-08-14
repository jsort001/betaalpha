-- iCal subscription feed for the chapter calendar. Calendar apps
-- (Google/Apple/Outlook) fetch the feed URL directly with no login,
-- so access is gated by a secret token instead of Supabase auth.
-- Singleton table (id must be true) holding that one shared token;
-- any linked member can read it to build their subscribe link,
-- alumni can regenerate it to revoke a leaked link.

create table public.calendar_feed_settings (
  id boolean primary key default true,
  token text not null,
  updated_at timestamptz not null default now(),
  constraint calendar_feed_settings_singleton check (id)
);

alter table public.calendar_feed_settings enable row level security;

create policy "calendar_feed_settings_select_linked" on public.calendar_feed_settings
  for select to authenticated
  using (public.current_user_role() is not null);

create policy "calendar_feed_settings_update_alumni" on public.calendar_feed_settings
  for update to authenticated
  using (public.current_user_role() = 'alumni')
  with check (public.current_user_role() = 'alumni');

create extension if not exists pgcrypto with schema extensions;

insert into public.calendar_feed_settings (id, token)
values (true, encode(extensions.gen_random_bytes(24), 'hex'));
