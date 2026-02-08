-- Admin policies for managing properties and viewing tenants

create policy "Admins update properties"
on public.properties
for update
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_type = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_type = 'admin'
  )
);

create policy "Admins read tenants"
on public.tenants
for select
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_type = 'admin'
  )
);
