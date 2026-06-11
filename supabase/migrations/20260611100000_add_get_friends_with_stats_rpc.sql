CREATE OR REPLACE FUNCTION get_friends_with_stats()
RETURNS TABLE (
  friendship_id  uuid,
  user_id        uuid,
  username       text,
  level          integer,
  avatar_url     text,
  status         text,
  is_requester   boolean,
  total_checkins bigint,
  rank           bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH friend_list AS (
    SELECT
      f.id AS friendship_id,
      f.status,
      CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END AS friend_id,
      (f.requester_id = auth.uid()) AS is_requester
    FROM friendships f
    WHERE (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
      AND f.status != 'rejected'
  ),
  checkin_counts AS (
    SELECT c.user_id, COUNT(*) AS total_checkins
    FROM checkins c
    WHERE c.is_first = true
      AND c.user_id IN (SELECT friend_id FROM friend_list)
    GROUP BY c.user_id
  ),
  user_ranks AS (
    SELECT
      p.id,
      RANK() OVER (ORDER BY p.total_xp DESC) AS rank
    FROM user_profiles p
  )
  SELECT
    fl.friendship_id,
    fl.friend_id                    AS user_id,
    p.username,
    p.level,
    p.avatar_url,
    fl.status,
    fl.is_requester,
    COALESCE(cc.total_checkins, 0)  AS total_checkins,
    ur.rank
  FROM friend_list fl
  JOIN user_profiles p ON p.id = fl.friend_id
  LEFT JOIN checkin_counts cc ON cc.user_id = fl.friend_id
  JOIN user_ranks ur ON ur.id = fl.friend_id
$$;
