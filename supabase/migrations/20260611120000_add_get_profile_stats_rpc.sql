CREATE OR REPLACE FUNCTION get_profile_stats(p_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH location_totals AS (
    SELECT theme_id, COUNT(*)::integer AS total
    FROM locations
    WHERE is_active = true
    GROUP BY theme_id
  ),
  user_checkins AS (
    SELECT l.theme_id, COUNT(*)::integer AS checked
    FROM checkins c
    JOIN locations l ON l.id = c.location_id
    WHERE c.user_id = p_user_id AND c.is_first = true
    GROUP BY l.theme_id
  )
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'user_code', p.user_code,
        'avatar_url', p.avatar_url,
        'total_xp', p.total_xp,
        'level', p.level,
        'active_title_id', p.active_title_id,
        'titles', CASE WHEN t.id IS NOT NULL
          THEN json_build_object('name', t.name, 'name_en', t.name_en, 'name_zh', t.name_zh)
          ELSE NULL END,
        'rank', (SELECT COUNT(*) + 1 FROM user_profiles WHERE total_xp > COALESCE(p.total_xp, -1))
      )
      FROM user_profiles p
      LEFT JOIN titles t ON t.id = p.active_title_id
      WHERE p.id = p_user_id
    ),
    'earned_titles', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', t.id,
        'name', t.name,
        'name_en', t.name_en,
        'name_zh', t.name_zh,
        'description', t.description
      )), '[]'::json)
      FROM user_titles ut
      JOIN titles t ON t.id = ut.title_id
      WHERE ut.user_id = p_user_id
    ),
    'theme_progress', (
      SELECT COALESCE(json_agg(json_build_object(
        'uuid', th.uuid,
        'theme_id', th.theme_id,
        'name', th.name,
        'name_en', th.name_en,
        'name_zh', th.name_zh,
        'color', th.color,
        'icon', th.icon,
        'total', COALESCE(lt.total, 0),
        'checked', COALESCE(uc.checked, 0)
      )), '[]'::json)
      FROM themes th
      LEFT JOIN location_totals lt ON lt.theme_id = th.theme_id
      LEFT JOIN user_checkins uc ON uc.theme_id = th.theme_id
    )
  ) INTO result;

  RETURN result;
END;
$$;
