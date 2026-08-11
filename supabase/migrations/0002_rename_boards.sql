-- Rename the original 4 boards to the chapter's actual committee names,
-- and add the 5th. Renaming in place (rather than delete+insert) keeps
-- existing tasks attached to their board.

update public.boards
  set name = 'Community Service',
      description = 'Community service projects and volunteer hours'
  where name = 'Officer Duties';

update public.boards
  set name = 'Social',
      description = 'Social events and mixers'
  where name = 'New Member Requirements';

update public.boards
  set name = 'Fundraising',
      description = 'Fundraising campaigns and philanthropy events'
  where name = 'Events & Philanthropy';

update public.boards
  set name = 'Fall Informational',
      description = 'Fall recruitment informational events'
  where name = 'Risk & Compliance';

insert into public.boards (name, description) values
  ('Cultural Event', 'Cultural events and programming');
