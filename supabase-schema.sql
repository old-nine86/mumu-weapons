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
to public
with check (status = 'pending');

grant usage on schema public to anon, authenticated;
grant select, insert on public.weapons to anon, authenticated;
grant insert on public.promotion_submissions to anon, authenticated;
grant select on public.upload_quota_rules to anon, authenticated;

create table if not exists public.upload_quota_rules (
  id text primary key default 'default',
  free_per_ip integer not null default 2,
  bonus_per_approved_promotion integer not null default 10,
  updated_at timestamptz not null default now()
);

alter table public.upload_quota_rules enable row level security;

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

create table if not exists public.admin_settings (
  id text primary key,
  review_key text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

insert into public.admin_settings (id, review_key)
values ('default', 'CHANGE_ME_IN_SUPABASE')
on conflict (id) do nothing;

create or replace function public.list_pending_weapons(input_review_key text)
returns table (
  id text,
  name text,
  type text,
  label text,
  description text,
  features jsonb,
  skill text,
  fx text,
  creator text,
  image_url text,
  defense integer,
  crit numeric,
  status text,
  share_proof text,
  review_note text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_settings
    where admin_settings.id = 'default'
      and admin_settings.review_key = input_review_key
  ) then
    raise exception 'invalid review key';
  end if;

  return query
  select w.id, w.name, w.type, w.label, w.description, w.features, w.skill, w.fx,
         w.creator, w.image_url, w.defense, w.crit, w.status, w.share_proof,
         w.review_note, w.created_at
  from public.weapons w
  where w.status = 'pending'
  order by w.created_at desc;
end;
$$;

create or replace function public.review_weapon(
  input_review_key text,
  weapon_id text,
  decision text,
  note text default ''
)
returns table (
  id text,
  name text,
  status text,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admin_settings
    where admin_settings.id = 'default'
      and admin_settings.review_key = input_review_key
  ) then
    raise exception 'invalid review key';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'invalid decision';
  end if;

  return query
  update public.weapons w
  set status = decision,
      review_note = coalesce(note, ''),
      reviewed_at = now()
  where w.id = weapon_id and w.status = 'pending'
  returning w.id, w.name, w.status, w.reviewed_at;
end;
$$;

grant execute on function public.list_pending_weapons(text) to anon, authenticated;
grant execute on function public.review_weapon(text, text, text, text) to anon, authenticated;

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
