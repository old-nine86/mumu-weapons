-- Admin image refinement upgrade for Mumu Brick Weapons.
-- Run this in Supabase SQL Editor if the admin page says
-- `admin_replace_weapon_image` does not exist.

drop function if exists public.list_admin_weapons(text);
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
  name_en text,
  label_en text,
  description_en text,
  skill_en text,
  features_en jsonb,
  locale text,
  defense integer,
  crit numeric,
  piece_count integer,
  ai_power integer,
  card_rarity text,
  card_score integer,
  analysis jsonb,
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
         w.image_url, w.showcase_url, w.name_en, w.label_en, w.description_en, w.skill_en, w.features_en, w.locale, w.defense, w.crit, w.piece_count,
         w.ai_power, w.card_rarity, w.card_score, w.analysis, w.status, w.created_at
  from public.weapons w
  where w.status = 'approved'
  order by w.created_at desc;
end;
$$;

grant execute on function public.list_admin_weapons(text) to anon, authenticated;

drop function if exists public.admin_replace_weapon_image(text, text, text, text);
create or replace function public.admin_replace_weapon_image(
  input_review_key text,
  weapon_id text,
  new_image_url text,
  original_image_url text default ''
)
returns table (
  id text,
  image_url text,
  analysis jsonb,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_original text;
begin
  if not exists (
    select 1 from public.admin_settings
    where admin_settings.id = 'default'
      and admin_settings.review_key = input_review_key
  ) then
    raise exception 'invalid review key';
  end if;

  if coalesce(new_image_url, '') = '' then
    raise exception 'new image url is required';
  end if;

  select coalesce(w.analysis->>'original_image_url', nullif(original_image_url, ''), w.image_url)
  into current_original
  from public.weapons w
  where w.id = weapon_id;

  return query
  update public.weapons w
  set image_url = new_image_url,
      analysis = coalesce(w.analysis, '{}'::jsonb)
        || jsonb_build_object(
          'original_image_url', coalesce(current_original, w.image_url),
          'refined_image_url', new_image_url,
          'refined_by', 'admin-browser-cutout-v1',
          'refined_at', now()
        )
  where w.id = weapon_id
  returning w.id, w.image_url, w.analysis, w.status;
end;
$$;

grant execute on function public.admin_replace_weapon_image(text, text, text, text) to anon, authenticated;
