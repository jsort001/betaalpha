-- Contacts imported from the spreadsheet used "Last, First" for
-- some entries and "First Last" for others. Normalize every
-- comma-formatted name to "First Last" so display, editing, and
-- name sorting are all consistent.

update public.contacts
set name = trim(split_part(name, ',', 2)) || ' ' || trim(split_part(name, ',', 1))
where name like '%,%';
