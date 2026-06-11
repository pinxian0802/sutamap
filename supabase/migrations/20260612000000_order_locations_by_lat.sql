-- 主題內景點依緯度由高到低（北 → 南）排序
create or replace function public.get_locations_for_theme(p_theme_id text)
returns json
language sql
security definer
as $$
  select coalesce(json_agg(l order by l.lat desc), '[]'::json)
  from public.locations l
  where l.theme_id = p_theme_id and l.is_active = true;
$$;
