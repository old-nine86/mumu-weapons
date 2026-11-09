-- 沐沐积木武器库 · V2 后台预览所需额外 RPC
-- 预览页会尝试调用这些函数；未部署前 UI 会显示只读 / 示例态，不会绕过 RLS。
-- 请在 Supabase SQL Editor 中手动执行本文件。本文件不会自动应用到线上库。
-- 绝不在此文件写入真实 review_key。

-- 1) 总览统计
create or replace function public.admin_dashboard_stats(input_review_key text)
returns table (
  weapons_pending integer,
  weapons_approved integer,
  weapons_rejected integer,
  promotions_pending integer,
  promotions_approved integer,
  promotions_rejected integer,
  forum_topics_visible integer,
  forum_topics_hidden integer,
  forum_replies_visible integer,
  forum_replies_hidden integer
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
  select
    (select count(*)::integer from public.weapons w where w.status = 'pending'),
    (select count(*)::integer from public.weapons w where w.status = 'approved'),
    (select count(*)::integer from public.weapons w where w.status = 'rejected'),
    (select count(*)::integer from public.promotion_submissions p where p.status = 'pending'),
    (select count(*)::integer from public.promotion_submissions p where p.status = 'approved'),
    (select count(*)::integer from public.promotion_submissions p where p.status = 'rejected'),
    (select count(*)::integer from public.forum_topics t where t.status = 'approved'),
    (select count(*)::integer from public.forum_topics t where t.status = 'hidden'),
    (select count(*)::integer from public.forum_replies r where r.status = 'approved'),
    (select count(*)::integer from public.forum_replies r where r.status = 'hidden');
end;
$$;

grant execute on function public.admin_dashboard_stats(text) to anon, authenticated;

-- 2) 全部推广证明（含已审）
create or replace function public.list_admin_promotions(input_review_key text)
returns table (
  id uuid,
  creator text,
  proof text,
  status text,
  bonus_slots integer,
  review_note text,
  reviewed_at timestamptz,
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
  select p.id, p.creator, p.proof, p.status, p.bonus_slots, p.review_note, p.reviewed_at, p.created_at
  from public.promotion_submissions p
  order by coalesce(p.reviewed_at, p.created_at) desc;
end;
$$;

grant execute on function public.list_admin_promotions(text) to anon, authenticated;

-- 3) 审核履历（武器 + 推广）
create or replace function public.list_admin_moderation_history(input_review_key text)
returns table (
  kind text,
  item_id text,
  title text,
  actor text,
  status text,
  review_note text,
  reviewed_at timestamptz,
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
  (
    select
      'weapon'::text as kind,
      w.id::text as item_id,
      w.name as title,
      w.creator as actor,
      w.status,
      w.review_note,
      w.reviewed_at,
      w.created_at
    from public.weapons w
    where w.status in ('approved', 'rejected')
  )
  union all
  (
    select
      'promotion'::text,
      p.id::text,
      left(p.proof, 40),
      p.creator,
      p.status,
      p.review_note,
      p.reviewed_at,
      p.created_at
    from public.promotion_submissions p
    where p.status in ('approved', 'rejected')
  )
  order by 7 desc nulls last, 8 desc;
end;
$$;

grant execute on function public.list_admin_moderation_history(text) to anon, authenticated;

-- 4) 论坛主题（含隐藏）
create or replace function public.list_admin_forum_topics(input_review_key text)
returns table (
  id uuid,
  name text,
  category text,
  title text,
  body text,
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
  select t.id, t.name, t.category, t.title, t.body, t.status, t.created_at
  from public.forum_topics t
  order by t.created_at desc;
end;
$$;

grant execute on function public.list_admin_forum_topics(text) to anon, authenticated;

-- 5) 论坛回复（含隐藏）
create or replace function public.list_admin_forum_replies(input_review_key text)
returns table (
  id uuid,
  topic_id uuid,
  name text,
  body text,
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
  select r.id, r.topic_id, r.name, r.body, r.status, r.created_at
  from public.forum_replies r
  order by r.created_at desc;
end;
$$;

grant execute on function public.list_admin_forum_replies(text) to anon, authenticated;

-- 6) 主题隐藏 / 恢复
create or replace function public.admin_set_forum_topic_status(
  input_review_key text,
  topic_id uuid,
  new_status text
)
returns table (
  id uuid,
  title text,
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

  if new_status not in ('approved', 'hidden') then
    raise exception 'invalid status';
  end if;

  return query
  update public.forum_topics t
  set status = new_status
  where t.id = topic_id
  returning t.id, t.title, t.status;
end;
$$;

grant execute on function public.admin_set_forum_topic_status(text, uuid, text) to anon, authenticated;

-- 7) 回复隐藏 / 恢复
create or replace function public.admin_set_forum_reply_status(
  input_review_key text,
  reply_id uuid,
  new_status text
)
returns table (
  id uuid,
  topic_id uuid,
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

  if new_status not in ('approved', 'hidden') then
    raise exception 'invalid status';
  end if;

  return query
  update public.forum_replies r
  set status = new_status
  where r.id = reply_id
  returning r.id, r.topic_id, r.status;
end;
$$;

grant execute on function public.admin_set_forum_reply_status(text, uuid, text) to anon, authenticated;

-- 8) 上传配额更新（只改 default 行）
create or replace function public.admin_update_upload_quota(
  input_review_key text,
  new_free_per_ip integer,
  new_bonus_per_approved_promotion integer
)
returns table (
  id text,
  free_per_ip integer,
  bonus_per_approved_promotion integer,
  updated_at timestamptz
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

  if new_free_per_ip is null or new_free_per_ip < 0 or new_free_per_ip > 500 then
    raise exception 'invalid free_per_ip';
  end if;
  if new_bonus_per_approved_promotion is null
     or new_bonus_per_approved_promotion < 0
     or new_bonus_per_approved_promotion > 100 then
    raise exception 'invalid bonus_per_approved_promotion';
  end if;

  return query
  update public.upload_quota_rules q
  set free_per_ip = new_free_per_ip,
      bonus_per_approved_promotion = new_bonus_per_approved_promotion,
      updated_at = now()
  where q.id = 'default'
  returning q.id, q.free_per_ip, q.bonus_per_approved_promotion, q.updated_at;
end;
$$;

grant execute on function public.admin_update_upload_quota(text, integer, integer) to anon, authenticated;
