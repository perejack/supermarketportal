-- ==============================================================================
-- StaffHub / SupermarketPortal - Full Supabase Database & Storage Setup
-- Project URL: https://nlnuscpzgutkfapyneaa.supabase.co
--
-- Instructions:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/nlnuscpzgutkfapyneaa/sql/new
-- 2. Paste this entire SQL script and click "Run".
-- ==============================================================================

-- 1. Enable UUID Extension (Postgres)
create extension if not exists "uuid-ossp";

-- 2. Create Applications Table with duplicate protection and usage tracking
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Employee identity & job details
  employer text not null,                -- 'carrefour' | 'quickmart' | 'naivas'
  full_name text not null,
  staff_number text not null,
  position text not null,
  branch text,

  -- Onboarding details
  uniform_size text,
  uniform_types text[] default '{}',
  locker_requested boolean default false,
  locker_keys int,
  training_accepted boolean default false,
  training_reviewed boolean default false,
  badge_submitted boolean default false,
  contract_downloaded boolean default false,

  -- Payment fields
  payment_completed boolean default false,
  payment_ref text,
  payment_phone text,
  payment_at timestamptz,
  payment_amount int default 10,

  -- Document storage paths (inside Supabase Storage 'applications' bucket)
  photo_path text,
  id_front_path text,
  id_back_path text,

  -- Admin status & processing (Mark as Used / Not Used)
  is_used boolean not null default false,
  used_at timestamptz,

  -- Prevent duplicate records per employee under the same employer
  constraint applications_employer_staff_number_unique unique (employer, staff_number)
);

-- 3. In case the table already existed without the new columns or unique constraint:
do $$
begin
  -- Add is_used if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'applications' and column_name = 'is_used'
  ) then
    alter table public.applications add column is_used boolean not null default false;
  end if;

  -- Add used_at if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'applications' and column_name = 'used_at'
  ) then
    alter table public.applications add column used_at timestamptz;
  end if;

  -- Add updated_at if missing
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'applications' and column_name = 'updated_at'
  ) then
    alter table public.applications add column updated_at timestamptz not null default now();
  end if;
end $$;

-- 4. Clean up any existing duplicates (keeps newest entry) before enforcing unique constraint
delete from public.applications a
using public.applications b
where a.employer = b.employer
  and a.staff_number = b.staff_number
  and (a.created_at < b.created_at or (a.created_at = b.created_at and a.id < b.id));

-- Add unique constraint if not already present
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'applications_employer_staff_number_unique'
  ) then
    alter table public.applications
      add constraint applications_employer_staff_number_unique unique (employer, staff_number);
  end if;
exception when others then
  null;
end $$;

-- 5. Auto-update updated_at timestamp trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

-- 6. Performance Indexes
create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_staff_number_idx on public.applications (staff_number);
create index if not exists applications_employer_idx on public.applications (employer);
create index if not exists applications_is_used_idx on public.applications (is_used);
create index if not exists applications_payment_completed_idx on public.applications (payment_completed);

-- 7. Deduplicated View for Admin (guarantees strictly 1 row per employee, highest priority to paid/latest)
create or replace view public.admin_applications_view as
select distinct on (employer, staff_number) *
from public.applications
order by employer, staff_number, payment_completed desc, created_at desc;

-- 8. Storage Bucket for uploaded documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applications',
  'applications',
  false,
  52428800, -- 50MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update set
  public = false;

-- 9. Row Level Security (RLS)
alter table public.applications enable row level security;

-- Policy: Service role has full access (used by server-side Next.js API routes)
drop policy if exists "Service role has full access to applications" on public.applications;
create policy "Service role has full access to applications"
on public.applications
for all
using (true)
with check (true);

-- Storage RLS: allow full access to applications bucket
drop policy if exists "Full access to applications bucket" on storage.objects;
create policy "Full access to applications bucket"
on storage.objects
for all
using (bucket_id = 'applications')
with check (bucket_id = 'applications');
