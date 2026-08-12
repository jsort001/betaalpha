-- Tasks imported from chapter meeting notes. Uses the Administrative
-- and Chipotle/Panda Express Fundraiser boards you already created
-- (rather than inserting a duplicate/stale-named board). Tasks for
-- Ian/the Collaboration item are left unassigned since Ian and
-- Wilson aren't registered app users yet; created_by is set to
-- Jairo (who supplied the notes for this import).

update public.boards set category = 'Administrative'
where name = 'Administrative' and category is null;

-- Sergio Aguirre
insert into public.tasks (board_id, title, description, owner_id, status, priority, created_by)
select
  (select id from public.boards where name = 'Administrative'),
  'Draft dues structure document',
  'Create a Word document in the shared files to discuss the dues structure and share it on Slack for further discussion.',
  (select id from public.users where email = 'sergio.aguirrepoloche@launidadlatina.org'),
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

insert into public.tasks (board_id, title, description, owner_id, status, priority, created_by)
select
  (select id from public.boards where name = 'Administrative'),
  'Add Benny to Slack and align communication channels',
  'Add Benny to the Beta Alpha Slack group and ensure all communication is copied to the three main channels (email, Slack, group chat).',
  (select id from public.users where email = 'sergio.aguirrepoloche@launidadlatina.org'),
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

-- Ian (unassigned -- not yet a registered user)
insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Administrative'),
  'Schedule meeting with ODU Fraternity & Sorority Life director',
  'Reach out to the director of Fraternity and Sorority Life at ODU to schedule a meeting regarding the chapter''s academic probation and other matters. CC HCS and other advisors.',
  'not_started',
  'high',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Administrative'),
  'Follow up with National Council on Convention penalty',
  'Follow up with National Council regarding the penalty for not attending the National Convention and communicate the response to HCS and others.',
  'not_started',
  'high',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Chipotle/Panda Express Fundraiser'),
  'Discuss LUL Foundation fundraising rules with Benny',
  'Reach out to Benny separately to discuss the details and regulations of using the LUL Foundation for fundraising (e.g., Chipotle).',
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Chipotle/Panda Express Fundraiser'),
  'Schedule Mojo''s fundraising event for November',
  'Reach out to Mojo''s this month to schedule a fundraising event for November.',
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Chipotle/Panda Express Fundraiser'),
  'Create flyers for planned events',
  'Create flyers for all planned events (e.g., Panda Express, Mojo''s, P Franks) and have them ready for the incoming freshman event and student organization fair.',
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');

-- Collaboration
insert into public.tasks (board_id, title, description, status, priority, created_by)
select
  (select id from public.boards where name = 'Administrative'),
  'Start chapter marketing and promotion',
  'Undergrads (led by Ian/Wilson): Start marketing and promotion for the chapter immediately, using tools like PosterMyWall or Canva for flyers.',
  'not_started',
  'normal',
  (select id from public.users where email = 'jairo.sorto@gmail.com');
