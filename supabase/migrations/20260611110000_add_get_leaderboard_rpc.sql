CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id             uuid,
  username       text,
  level          integer,
  avatar_url     text,
  total_xp       integer,
  total_checkins bigint,
  is_friend      boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH checkin_counts AS (
    SELECT user_id, COUNT(*) AS total_checkins
    FROM checkins
    WHERE is_first = true
    GROUP BY user_id
  ),
  friend_ids AS (
    SELECT
      CASE WHEN requester_id = auth.uid() THEN addressee_id ELSE requester_id END AS friend_id
    FROM friendships
    WHERE auth.uid() IS NOT NULL
      AND (requester_id = auth.uid() OR addressee_id = auth.uid())
      AND status = 'accepted'
  ),
  top_by_xp AS (
    SELECT p.id FROM user_profiles p ORDER BY p.total_xp DESC LIMIT 50
  ),
  top_by_checkins AS (
    SELECT cc.user_id AS id FROM checkin_counts cc ORDER BY cc.total_checkins DESC LIMIT 50
  ),
  relevant_ids AS (
    SELECT id FROM top_by_xp
    UNION
    SELECT id FROM top_by_checkins
    UNION
    SELECT friend_id AS id FROM friend_ids
    UNION
    SELECT auth.uid() WHERE auth.uid() IS NOT NULL
  )
  SELECT
    p.id,
    p.username,
    p.level,
    p.avatar_url,
    p.total_xp,
    COALESCE(cc.total_checkins, 0)             AS total_checkins,
    (fi.friend_id IS NOT NULL OR p.id = auth.uid()) AS is_friend
  FROM relevant_ids ri
  JOIN user_profiles p ON p.id = ri.id
  LEFT JOIN checkin_counts cc ON cc.user_id = p.id
  LEFT JOIN friend_ids fi ON fi.friend_id = p.id
$$;
