-- Supabase setup for Mumu Weapons.
-- Run this in Supabase SQL Editor, then create a public storage bucket named:
-- mumu-weapon-images

create table if not exists public.weapons (
  id text primary key,
  name text not null,
  type text not null check (type in ('sword', 'gun', 'spear')),
  label text not null,
  description text not null,
  features jsonb not null default '[]'::jsonb,
  skill text not null,
  fx text not null,
  creator text not null,
  image_url text not null,
  defense integer not null default 82,
  crit numeric not null default 0.12,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  share_proof text not null default '',
  review_note text not null default '',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.weapons add column if not exists status text not null default 'pending';
alter table public.weapons add column if not exists share_proof text not null default '';
alter table public.weapons add column if not exists review_note text not null default '';
alter table public.weapons add column if not exists reviewed_at timestamptz;

alter table public.weapons enable row level security;

create index if not exists weapons_status_created_at_idx
on public.weapons (status, created_at desc);

drop policy if exists "Public can read weapons" on public.weapons;
drop policy if exists "Public can read approved weapons" on public.weapons;
create policy "Public can read approved weapons"
on public.weapons for select
to anon
using (status = 'approved');

drop policy if exists "Public can submit weapons" on public.weapons;
create policy "Public can submit weapons"
on public.weapons for insert
to anon
with check (
  char_length(name) between 1 and 20
  and char_length(creator) between 1 and 16
  and char_length(description) <= 90
  and char_length(skill) <= 22
  and char_length(share_proof) <= 180
  and status = 'pending'
);

create table if not exists public.upload_quota_rules (
  id text primary key default 'default',
  free_per_ip integer not null default 2,
  bonus_per_approved_promotion integer not null default 10,
  updated_at timestamptz not null default now()
);

insert into public.upload_quota_rules (id, free_per_ip, bonus_per_approved_promotion)
values ('default', 2, 10)
on conflict (id) do update
set free_per_ip = excluded.free_per_ip,
    bonus_per_approved_promotion = excluded.bonus_per_approved_promotion,
    updated_at = now();

create table if not exists public.promotion_submissions (
  id uuid primary key default gen_random_uuid(),
  creator text not null,
  proof text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  bonus_slots integer not null default 10,
  review_note text not null default '',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promotion_submissions enable row level security;

drop policy if exists "Public can submit promotion proof" on public.promotion_submissions;
create policy "Public can submit promotion proof"
on public.promotion_submissions for insert
to anon
with check (
  char_length(creator) between 1 and 16
  and char_length(proof) between 1 and 180
  and status = 'pending'
  and bonus_slots = 10
);

-- Storage policies. Create bucket first in Storage UI:
-- bucket id: mumu-weapon-images
-- Public bucket: on

drop policy if exists "Public can read weapon images" on storage.objects;
create policy "Public can read weapon images"
on storage.objects for select
to anon
using (bucket_id = 'mumu-weapon-images');

drop policy if exists "Public can upload weapon images" on storage.objects;
create policy "Public can upload weapon images"
on storage.objects for insert
to anon
with check (bucket_id = 'mumu-weapon-images');
