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
  showcase_url text not null default '',
  defense integer not null default 82,
  crit numeric not null default 0.12,
  piece_count integer not null default 0,
  ai_power integer not null default 100,
  analysis jsonb not null default '{}'::jsonb,
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
alter table public.weapons add column if not exists piece_count integer not null default 0;
alter table public.weapons add column if not exists ai_power integer not null default 100;
alter table public.weapons add column if not exists analysis jsonb not null default '{}'::jsonb;
alter table public.weapons add column if not exists showcase_url text not null default '';

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
  client_token text not null default gen_random_uuid()::text,
  creator text not null,
  proof text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  bonus_slots integer not null default 10,
  review_note text not null default '',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promotion_submissions add column if not exists client_token text not null default gen_random_uuid()::text;
alter table public.promotion_submissions enable row level security;
create unique index if not exists promotion_submissions_client_token_idx
on public.promotion_submissions (client_token);

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

drop function if exists public.list_pending_weapons_v2(text);
create or replace function public.list_pending_weapons_v2(input_review_key text)
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
  showcase_url text,
  defense integer,
  crit numeric,
  piece_count integer,
  ai_power integer,
  analysis jsonb,
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
         w.creator, w.image_url, w.showcase_url, w.defense, w.crit, w.piece_count, w.ai_power, w.analysis,
         w.status, w.share_proof, w.review_note, w.created_at
  from public.weapons w
  where w.status = 'pending'
  order by w.created_at desc;
end;
$$;

grant execute on function public.list_pending_weapons_v2(text) to anon, authenticated;

create or replace function public.review_weapon_with_edits(
  input_review_key text,
  weapon_id text,
  decision text,
  note text default '',
  edited_name text default null,
  edited_creator text default null,
  edited_piece_count integer default null,
  edited_ai_power integer default null,
  edited_defense integer default null,
  edited_crit numeric default null
)
returns table (
  id text,
  name text,
  creator text,
  status text,
  piece_count integer,
  ai_power integer,
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
  set name = coalesce(nullif(left(edited_name, 20), ''), w.name),
      creator = coalesce(nullif(left(edited_creator, 16), ''), w.creator),
      piece_count = greatest(0, least(300, coalesce(edited_piece_count, w.piece_count))),
      ai_power = greatest(1, least(500, coalesce(edited_ai_power, w.ai_power))),
      defense = greatest(1, least(300, coalesce(edited_defense, w.defense))),
      crit = greatest(0, least(1, coalesce(edited_crit, w.crit))),
      status = decision,
      review_note = coalesce(note, ''),
      reviewed_at = now()
  where w.id = weapon_id and w.status = 'pending'
  returning w.id, w.name, w.creator, w.status, w.piece_count, w.ai_power, w.reviewed_at;
end;
$$;

grant execute on function public.review_weapon_with_edits(text, text, text, text, text, text, integer, integer, integer, numeric) to anon, authenticated;

create or replace function public.list_admin_weapons(input_review_key text)
returns table (
  id text,
  name text,
  type text,
  label text,
  description text,
  skill text,
  creator text,
  image_url text,
  showcase_url text,
  defense integer,
  crit numeric,
  piece_count integer,
  ai_power integer,
  status text,
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
  select w.id, w.name, w.type, w.label, w.description, w.skill, w.creator,
         w.image_url, w.showcase_url, w.defense, w.crit, w.piece_count,
         w.ai_power, w.status, w.created_at
  from public.weapons w
  where w.status = 'approved'
  order by w.created_at desc;
end;
$$;

create or replace function public.admin_update_weapon(
  input_review_key text,
  weapon_id text,
  edited_name text default null,
  edited_type text default null,
  edited_label text default null,
  edited_description text default null,
  edited_skill text default null,
  edited_creator text default null,
  edited_showcase_url text default null,
  edited_piece_count integer default null,
  edited_ai_power integer default null,
  edited_defense integer default null,
  edited_crit numeric default null
)
returns table (
  id text,
  name text,
  type text,
  label text,
  description text,
  skill text,
  creator text,
  showcase_url text,
  piece_count integer,
  ai_power integer,
  defense integer,
  crit numeric,
  status text
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

  if edited_type is not null and edited_type not in ('sword','gun','spear') then
    raise exception 'invalid weapon type';
  end if;

  return query
  update public.weapons w
  set name = coalesce(nullif(left(edited_name, 20), ''), w.name),
      type = coalesce(nullif(edited_type, ''), w.type),
      label = coalesce(nullif(left(edited_label, 20), ''), w.label),
      description = coalesce(nullif(left(edited_description, 120), ''), w.description),
      skill = coalesce(nullif(left(edited_skill, 28), ''), w.skill),
      creator = coalesce(nullif(left(edited_creator, 16), ''), w.creator),
      showcase_url = coalesce(edited_showcase_url, w.showcase_url),
      piece_count = greatest(0, least(300, coalesce(edited_piece_count, w.piece_count))),
      ai_power = greatest(1, least(500, coalesce(edited_ai_power, w.ai_power))),
      defense = greatest(1, least(300, coalesce(edited_defense, w.defense))),
      crit = greatest(0, least(1, coalesce(edited_crit, w.crit)))
  where w.id = weapon_id
  returning w.id, w.name, w.type, w.label, w.description, w.skill, w.creator,
            w.showcase_url, w.piece_count, w.ai_power, w.defense, w.crit, w.status;
end;
$$;

grant execute on function public.list_admin_weapons(text) to anon, authenticated;
grant execute on function public.admin_update_weapon(text, text, text, text, text, text, text, text, text, integer, integer, integer, numeric) to anon, authenticated;

drop policy if exists "Public can submit promotion proof" on public.promotion_submissions;
create policy "Public can submit promotion proof"
on public.promotion_submissions for insert
to anon
with check (
  char_length(client_token) between 16 and 80
  and
  char_length(creator) between 1 and 16
  and char_length(proof) between 1 and 180
  and status = 'pending'
  and bonus_slots = 10
);

create or replace function public.list_pending_promotions(input_review_key text)
returns table (
  id uuid,
  creator text,
  proof text,
  status text,
  bonus_slots integer,
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
  select p.id, p.creator, p.proof, p.status, p.bonus_slots, p.review_note, p.created_at
  from public.promotion_submissions p
  where p.status = 'pending'
  order by p.created_at desc;
end;
$$;

create or replace function public.review_promotion(
  input_review_key text,
  promotion_id uuid,
  decision text,
  note text default ''
)
returns table (
  id uuid,
  creator text,
  status text,
  bonus_slots integer,
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
  update public.promotion_submissions p
  set status = decision,
      review_note = coalesce(note, ''),
      reviewed_at = now()
  where p.id = promotion_id and p.status = 'pending'
  returning p.id, p.creator, p.status, p.bonus_slots, p.reviewed_at;
end;
$$;

create or replace function public.check_promotion_bonus(input_client_token text)
returns table (
  approved_bonus integer,
  pending_count integer,
  rejected_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    coalesce(sum(case when p.status = 'approved' then p.bonus_slots else 0 end),0)::integer,
    count(*) filter (where p.status = 'pending')::integer,
    count(*) filter (where p.status = 'rejected')::integer
  from public.promotion_submissions p
  where p.client_token = input_client_token;
end;
$$;

grant execute on function public.list_pending_promotions(text) to anon, authenticated;
grant execute on function public.review_promotion(text, uuid, text, text) to anon, authenticated;
grant execute on function public.check_promotion_bonus(text) to anon, authenticated;

-- Cloud forum: public read/write, with status left for future moderation.
create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '讨论',
  title text not null,
  body text not null,
  status text not null default 'approved' check (status in ('approved','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  name text not null,
  body text not null,
  status text not null default 'approved' check (status in ('approved','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists forum_topics_status_created_idx
on public.forum_topics(status, created_at desc);

create index if not exists forum_replies_topic_status_created_idx
on public.forum_replies(topic_id, status, created_at asc);

alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;

drop policy if exists "Public can read approved forum topics" on public.forum_topics;
create policy "Public can read approved forum topics"
on public.forum_topics for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "Public can post forum topics" on public.forum_topics;
create policy "Public can post forum topics"
on public.forum_topics for insert
to anon, authenticated
with check (
  status = 'approved'
  and char_length(name) between 1 and 16
  and char_length(category) between 1 and 12
  and char_length(title) between 1 and 34
  and char_length(body) between 1 and 240
);

drop policy if exists "Public can read approved forum replies" on public.forum_replies;
create policy "Public can read approved forum replies"
on public.forum_replies for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "Public can post forum replies" on public.forum_replies;
create policy "Public can post forum replies"
on public.forum_replies for insert
to anon, authenticated
with check (
  status = 'approved'
  and char_length(name) between 1 and 16
  and char_length(body) between 1 and 120
);

grant select, insert on public.forum_topics to anon, authenticated;
grant select, insert on public.forum_replies to anon, authenticated;

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
