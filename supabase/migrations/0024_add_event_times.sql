-- Optional start/end time for chapter events, so an event can render
-- with a specific time instead of always as all-day.

alter table public.events add column start_time time;
alter table public.events add column end_time time;

alter table public.events add constraint events_end_time_requires_start_time check (
  end_time is null or start_time is not null
);
