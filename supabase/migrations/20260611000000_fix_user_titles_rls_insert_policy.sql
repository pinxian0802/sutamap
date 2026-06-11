-- user_titles 只有 SELECT policy，INSERT 被 RLS 靜默阻擋
-- 加上 INSERT policy 讓 checkin route 可以寫入
CREATE POLICY "users can insert own titles"
  ON public.user_titles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 補插因 RLS 遺漏的已完成稱號
-- 找出所有已完成主題但尚未寫入 user_titles 的使用者
INSERT INTO public.user_titles (user_id, title_id)
SELECT DISTINCT
  c.user_id,
  t.id AS title_id
FROM public.checkins c
JOIN public.locations l ON c.location_id = l.id
JOIN public.titles t ON t.theme_id = l.theme_id
WHERE c.is_first = true
GROUP BY c.user_id, l.theme_id, t.id
HAVING COUNT(*) = (
  SELECT COUNT(*) FROM public.locations
  WHERE theme_id = l.theme_id AND is_active = true
)
ON CONFLICT (user_id, title_id) DO NOTHING;
