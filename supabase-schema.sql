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
  created_at timestamptz not null default now()
);

alter table public.weapons enable row level security;

drop policy if exists "Public can read weapons" on public.weapons;
create policy "Public can read weapons"
on public.weapons for select
to anon
using (true);

drop policy if exists "Public can submit weapons" on public.weapons;
create policy "Public can submit weapons"
on public.weapons for insert
to anon
with check (
  char_length(name) between 1 and 20
  and char_length(creator) between 1 and 16
  and char_length(description) <= 90
  and char_length(skill) <= 22
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
