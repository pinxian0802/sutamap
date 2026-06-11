-- 繞過 PostgREST max_rows=1000 限制的 RPC functions

create or replace function public.get_location_counts_by_theme()
returns table(theme_id text, cnt bigint)
language sql
security definer
as $$
  select theme_id, count(*)::bigint as cnt
  from public.locations
  where is_active = true
  group by theme_id;
$$;

create function public.get_locations_for_theme(p_theme_id text)
returns json
language sql
security definer
as $$
  select coalesce(json_agg(l), '[]'::json)
  from public.locations l
  where l.theme_id = p_theme_id and l.is_active = true;
$$;

create function public.get_all_map_locations()
returns json
language sql
security definer
as $$
  select coalesce(json_agg(row_to_json(r)), '[]'::json)
  from (
    select
      l.id, l.name, l.name_en, l.name_zh,
      l.lat, l.lng, l.theme_id, l.prefecture, l.is_active,
      jsonb_build_object(
        'name', t.name, 'name_en', t.name_en, 'name_zh', t.name_zh,
        'color', t.color, 'icon', t.icon,
        'checkin_radius_meters', t.checkin_radius_meters,
        'xp_per_checkin', t.xp_per_checkin
      ) as themes
    from public.locations l
    join public.themes t on l.theme_id = t.theme_id
    where l.is_active = true
  ) r;
$$;
