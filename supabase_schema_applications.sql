-- StaffHub / SupermarketPortal - Supabase schema for storing applications + uploaded documents
-- Run this in Supabase SQL editor.

-- 1) Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  employer text not null,
  full_name text not null,
  staff_number text not null,
  position text not null,
  branch text,

  -- Onboarding fields
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
  payment_amount int,

  -- Storage paths (Supabase Storage)
  photo_path text,
  id_front_path text,
  id_back_path text
);

create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_staff_number_idx on public.applications (staff_number);
create index if not exists applications_employer_idx on public.applications (employer);

-- 2) Storage bucket
-- Create this in Storage UI if you prefer.
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;

-- 3) RLS
alter table public.applications enable row level security;

-- IMPORTANT:
-- This project uses a server-side service-role key for admin/API operations.
-- With that, RLS policies are not required for server access.
-- If you ever want to allow client-side (anon) inserts, add a restrictive policy here.

