-- Expand contacts with the fields from the Hermano Professional
-- Contacts Directory spreadsheet, and import its roster.

alter table public.contacts
  add column pledge_year text,
  add column major text,
  add column undergrad_grad_date text,
  add column grad_degree text,
  add column school_attended text,
  add column grad_school_grad_date text,
  add column job_field text,
  add column employer text,
  add column job_title text,
  add column location text;

insert into public.contacts
  (name, pledge_year, major, undergrad_grad_date, grad_degree, school_attended,
   grad_school_grad_date, job_field, employer, job_title, phone, email, location)
values
  ('Lorenzo, Bienvenido', 'Spring ''07', 'Mathematics', '2009', 'Higher Education', 'Old Dominion University', '2011', 'IT Program Manager', 'DOD', 'Program Manager', '703-728-0521', 'benny.lorenzo@gmail.com', '5608 Bloomfield Drive #203; Alexandria, VA 22312'),
  ('Cardenas, Juan', 'Spring ''07', 'Communications', null, null, 'Old Dominion University', null, null, null, null, null, null, null),
  ('Sorto, Jairo', 'Spring ''07', 'Communications', '2012', null, 'Old Dominion University', '2012', 'IT', 'Leidos', 'DevOps Engineer', '571-238-4612', 'jairo.sorto@gmail.com', '1653 White Dr. Vienna, VA 22182'),
  ('Vasquez, Joseph', 'Spring ''07', 'Business Management', '2016', null, 'Old Dominion University', '2016', 'Human Resources', 'SOS International, LLC (SOSi)/Government', 'Human Resources Business Partner', '703-814-0642', 'jvasq001@gmail.com', '434 Sugarland Run Dr, Sterling VA 20164'),
  ('Fuertes, Alexander', 'Spring ''07', null, null, null, null, null, null, 'City of Chicago Sanitation Department', null, null, null, null),
  ('Canonigo, Jason', 'Spring ''08', 'Mathematics', '2010', null, 'Old Dominion University', null, 'Naval Supply Officer_Logistics', 'Military/Navy', 'Supply Officer / Lieutenant', '757-348-6755', 'canonigo76@gmail.com', '3009 Firethorn Ave, Orange Park, FL 32073'),
  ('Elvir III, Raul', 'Spring ''08', null, '2011', null, null, null, null, null, null, null, null, null),
  ('Torres, Nate', 'Spring ''08', 'Finance', '2011', 'Juris Doctor', 'St. John''s University School of Law', '2014', 'Legal', 'Homeier & Law, P.C.', 'Corporate Finance & Securities Attorney', '757-871-9041', 'NateTorres1@gmail.com', null),
  ('Albarracin, Luis', 'Spring ''09', 'Engineering', null, null, null, null, null, null, null, null, null, null),
  ('Pinos, Allen', 'Spring ''09', 'Communications', '2010', null, null, null, 'Marketing', 'ChartwayFCU - Corporate', 'Digital Marketing Specialist', '757-358-6579', 'apino001@gmail.com', null),
  ('Yarleque, Percy', 'Spring ''09', 'Information Technology/Business Mgt', '2012', null, null, null, 'Cyber Security', 'FS-ISAC', 'Sr. Cyber Security Analyst', '571-426-2311', 'p.yarleque89@gmail.com', null),
  ('Mendez-Evans, Ralphael', 'Spring ''09', null, null, null, null, null, null, null, null, null, null, null),
  ('Santiago, Orlando', 'Spring ''09', 'Information Technology/Business Mgt', '2009', null, null, null, 'Cyber Security', 'Department of Defense/ Contractor for Indus Corporation', 'Information Assurance Analyst', '540-446-4263', 'orlando.santiago1@gmail.com', null),
  ('Burgos-Feliz, Enrique', 'Spring ''11', 'Civil Engineering', '2013', null, null, null, 'Civil Engineer', 'A. Morton Thomas & Associates, Inc', 'Senior Project Engineer', '804-299-9695', 'eburg010@gmail.com', 'Richmond, VA'),
  ('Mondragon, Kevin', 'Spring ''12', 'International Relations', '2014', 'Higher Education', 'ODU, Penn State', null, 'Higher Education', 'American University', 'Assistant Director of Admissions', '703-785-0042', 'mondragk@gmail.com', null),
  ('Gil, Irwin', 'Spring ''12', 'Biology', '2015', null, null, null, 'Building Management', 'Red Coats Inc', 'Account Manager', '757-639-9317', 'Igil32892@gmail.com', null),
  ('Blanco, Takeshi', 'Spring ''14', 'Business Mangement', '2014', null, null, null, null, null, null, '757-318-0161 (Only in the States)', null, null),
  ('Ching, Mauricio', 'Spring ''14', 'Criminal Justice', '2015', null, null, null, 'Firefighter/Paramedic', 'Stafford County Fire & Rescue Dept', 'Technician', '571-275-1360', 'moching94@gmail.com', null),
  ('Monterroso, Fito', 'Spring ''15', 'Computer Science', '2018', null, null, null, 'IT', 'GDIT', 'Sr. Software Engineer', '703-343-6526', 'rmonterroso95@gmail.com', null),
  ('Martinez, Alan', 'Spring ''15', 'Communications', '2018-2019', null, null, null, 'Admissions Office etc.', null, null, '571-465-8279', 'alanmart085@gmail.com', null),
  ('Jaldin, Marcelo', 'Spring ''15', null, '2016', null, null, null, null, null, null, null, null, null),
  ('Mondragon, Antony', null, 'Speech-Language Pathology and Audiology', '2019', 'Speech-Language Pathology', 'George Washington University', '2022', 'Skilled Nursing Facility', 'Leewood Rehabilitation', 'Director of Rehabilitation/ Speech-language Pathologist', '703-399-0514', 'antonymon97@gmail.com', '202 w 30th street, Norfolk Va, 23504'),
  ('DiMaggio, Dennis', null, null, null, null, null, null, null, null, null, null, null, null),
  ('Jordy Vera', null, null, null, null, null, null, null, null, null, null, null, null),
  ('Sergio Aguirre', null, null, null, null, null, null, null, null, null, null, null, null),
  ('Jose Umana', null, 'Computer Engineering', 'Spring 2023', null, null, null, 'Embedded Systems/Solar', 'Morningstar Corp', 'Embedded Software Engineer', '571-991-0107', 'joselumanap@gmail.com', '7653 Michelle Ct Manassas Va, 20109');
