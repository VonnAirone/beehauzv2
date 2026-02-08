-- Seed sample properties for the first owner profile (if any)

with owner as (
  select id
  from public.profiles
  where user_type = 'owner'
  order by created_at asc
  limit 1
)
insert into public.properties (owner_id, name, address)
select owner.id, seed.name, seed.address
from owner
cross join (
  values
    ('A and G Boarding House', 'Purok 7, Mang Juan, District 1, Sibalom, Antique'),
    ('Nanette''s Boarding House', 'Purok 6, District 1, Sibalom, Antique'),
    ('Ligaya''s Dormitory', 'Purok 5 (Boulevard), District 1, Sibalom, Antique'),
    ('Elcar Boarding House', 'S. Lotilla St., along U.A. Main Street, Sibalom, Antique'),
    ('Casa de Lex Boarding House', 'Villa Caridad Compound, District 1, Sibalom, Antique'),
    ('Nate & Nicky Boarding House', 'Purok 7, Brgy District 1, Sibalom, Antique'),
    ('Galician360 Dormitory', 'Purok 5, District 1 (Boulevard Near New Road), Sibalom, Antique'),
    ('LMN Boarding House', 'Villa Caridad Compound, Purok 7, District 1, Sibalom, Antique'),
    ('Panaligan Boarding House', 'Hoffelinia Subdivision, near Gate 1 and Gate 3, District 1, Sibalom, Antique'),
    ('Brickstone Hostel', 'Lotilla St., District 1, Sibalom, Antique'),
    ('J and A Boarding House', 'Purok 5, District 1 (Boulevard Area), Sibalom, Antique'),
    ('CDK Apartment Rentals', 'Near Fill Oil Gasoline Station, Purok 7, District 1, Sibalom, Antique'),
    ('R & L Boarding House', 'Purok 7, Brgy District 1, Sibalom, Antique'),
    ('Israelohim Dormitory', 'Purok 5, District 1, Sibalom, Antique')
) as seed(name, address);
