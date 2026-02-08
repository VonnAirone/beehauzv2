-- Owner dashboard tables

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  year_level text,
  school text,
  date_started date not null,
  date_left date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  amount numeric(10,2) not null,
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  requester_id uuid references public.profiles(id) on delete set null,
  requester_name text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.owner_notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  related_request_id uuid references public.booking_requests(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_payments enable row level security;
alter table public.booking_requests enable row level security;
alter table public.owner_notifications enable row level security;

create policy "Owners manage own properties"
on public.properties for all
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage tenants on own properties"
on public.tenants for all
using (property_id in (select id from public.properties where owner_id = auth.uid()))
with check (property_id in (select id from public.properties where owner_id = auth.uid()));

create policy "Owners manage payments on own properties"
on public.tenant_payments for all
using (
  tenant_id in (
    select t.id
    from public.tenants t
    join public.properties p on p.id = t.property_id
    where p.owner_id = auth.uid()
  )
)
with check (
  tenant_id in (
    select t.id
    from public.tenants t
    join public.properties p on p.id = t.property_id
    where p.owner_id = auth.uid()
  )
);

create policy "Owners manage booking requests on own properties"
on public.booking_requests for all
using (property_id in (select id from public.properties where owner_id = auth.uid()))
with check (property_id in (select id from public.properties where owner_id = auth.uid()));

create policy "Owners read notifications"
on public.owner_notifications for select
using (owner_id = auth.uid());

create policy "Owners update notifications"
on public.owner_notifications for update
using (owner_id = auth.uid()) with check (owner_id = auth.uid());
