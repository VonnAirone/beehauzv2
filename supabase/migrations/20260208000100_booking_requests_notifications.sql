-- Booking requests enhancements and notifications trigger

alter table public.booking_requests
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists heads_count integer;

-- Allow authenticated users (tenants) to create booking requests for any property
create policy "Users create booking requests"
on public.booking_requests
for insert
with check (requester_id = auth.uid());

-- Create notification on booking request insert
create or replace function public.handle_new_booking_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.owner_notifications (owner_id, title, body, related_request_id)
  select p.owner_id,
         'New booking request',
         coalesce(new.requester_name, 'A tenant') || ' requested a booking for ' || p.name,
         new.id
  from public.properties p
  where p.id = new.property_id;

  return new;
end;
$$;

create trigger booking_request_notification_trigger
after insert on public.booking_requests
for each row
execute function public.handle_new_booking_request();
