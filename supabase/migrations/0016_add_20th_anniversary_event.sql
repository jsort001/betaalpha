insert into public.events (title, start_date, created_by)
select
  'Beta Alpha Chapter 20th Anniversary',
  '2027-04-08',
  (select id from public.users where email = 'jairo.sorto@gmail.com');
