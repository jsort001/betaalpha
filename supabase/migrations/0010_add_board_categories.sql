-- Board categories: a fixed set for now, easy to extend later.
alter table public.boards
  add column category text
    check (category in (
      'Administrative', 'Community Service', 'Cultural',
      'Intake', 'Fundraising', 'Social'
    ));

-- Best-guess categorization for the existing boards; adjust anytime
-- via the board edit dialog.
update public.boards set category = 'Community Service' where name = 'Community Service';
update public.boards set category = 'Social' where name = 'Social';
update public.boards set category = 'Fundraising' where name = 'Fundraising';
update public.boards set category = 'Intake' where name = 'Fall Informational';
update public.boards set category = 'Cultural' where name = 'Cultural Event';
