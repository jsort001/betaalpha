-- Email notifications: dedup-tracking columns plus a scheduled job
-- that calls the send-task-notifications Edge Function every 15
-- minutes. The function itself queries these columns and stamps
-- them after a successful send so nothing double-sends.

alter table public.tasks
  add column assigned_notified_at timestamptz,
  add column due_soon_notified_at timestamptz,
  add column overdue_notified_at timestamptz;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-task-notifications',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://rfgwrjucfloaasxhvrhj.supabase.co/functions/v1/send-task-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZ3dyanVjZmxvYWFzeGh2cmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MDk0NTQsImV4cCI6MjEwMTk4NTQ1NH0.H8KNdQPwXVv8e_NC6c8gJbargJHCialrWlhWsgBXGW8',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
