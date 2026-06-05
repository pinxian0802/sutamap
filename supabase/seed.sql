-- Insert 四極点 category
insert into public.categories (id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  '00000000-0000-0000-0000-000000000001',
  '日本四極点',
  'Japan Extreme Points',
  '日本四極點',
  '日本本土の最北端・最南端・最東端・最西端',
  '#3b82f6',
  '🧭',
  500,
  100
);

-- Insert 四極点 locations
insert into public.locations (category_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('00000000-0000-0000-0000-000000000001', '宗谷岬', 'Cape Sōya', '宗谷岬', '北海道稚内市', 45.52278, 141.93639),
  ('00000000-0000-0000-0000-000000000001', '佐多岬', 'Cape Sata', '佐多岬', '鹿児島県南大隅町', 30.99500, 130.66167),
  ('00000000-0000-0000-0000-000000000001', '納沙布岬', 'Cape Nosappu', '納沙布岬', '北海道根室市', 43.38528, 145.81861),
  ('00000000-0000-0000-0000-000000000001', '神崎鼻', 'Cape Kanzaki', '神崎鼻', '長崎県佐世保市', 33.21417, 129.55500);

-- Insert title for 四極点
insert into public.titles (name, name_en, name_zh, description, category_id)
values ('四極探訪者', 'Four Extremes Explorer', '四極探訪者', '日本本土の四極点を全て訪れた', '00000000-0000-0000-0000-000000000001');

-- Insert badge for 四極点
insert into public.badges (name, name_en, name_zh, description, icon, category_id)
values ('四極点コンプリート', 'Four Extremes Complete', '四極點全制霸', '日本本土四極点を全て制覇', '🧭', '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- 稚内極北生活圏（極北一日遊）
-- ============================================================
insert into public.categories (id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  '00000000-0000-0000-0000-000000000002',
  '稚内極北生活圏',
  'Wakkanai Arctic Life',
  '稚內極北生活圈',
  '日本最北端の街・稚内で極北の日常スポットを巡る',
  '#06b6d4',
  '❄️',
  200,
  80
);

insert into public.locations (category_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('00000000-0000-0000-0000-000000000002', 'マクドナルド 40号稚内店', 'McDonald''s Route 40 Wakkanai', '麥當勞40號稚內店', '北海道稚内市', 45.39699, 141.68199),
  ('00000000-0000-0000-0000-000000000002', 'セイコーマート とみいそ店', 'Seicomart Tomiiso', 'Seicomart富磯店', '北海道稚内市', 45.40222, 141.69333),
  ('00000000-0000-0000-0000-000000000002', 'JR稚内駅', 'JR Wakkanai Station', 'JR稚內站', '北海道稚内市', 45.41611, 141.67278);

insert into public.titles (name, name_en, name_zh, description, category_id)
values ('北緯45度生活者', '45°N Dweller', '北緯45度生活者', '稚内極北生活圏を全て制覇した', '00000000-0000-0000-0000-000000000002');

insert into public.badges (name, name_en, name_zh, description, icon, category_id)
values ('極北生活圏コンプリート', 'Arctic Life Complete', '極北生活圈全制霸', '稚内極北生活圏の全スポットを制覇', '❄️', '00000000-0000-0000-0000-000000000002');
