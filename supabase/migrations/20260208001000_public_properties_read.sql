-- Allow public (authenticated) read access to properties and profiles

create policy "Public read properties"
on public.properties
for select
using (true);

create policy "Public read profiles"
on public.profiles
for select
using (true);
