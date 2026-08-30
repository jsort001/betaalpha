-- Full-text search for tasks, replacing substring ilike matching.
-- A generated tsvector column (title weighted above description) plus
-- a GIN index lets PostgREST's .textSearch() do real word/stem matching
-- instead of a plain %substring% scan.

alter table public.tasks
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

create index tasks_search_vector_idx on public.tasks using gin (search_vector);
