-- Insert 四極点 category
insert into public.categories (id, name, name_en, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  '00000000-0000-0000-0000-000000000001',
  '日本四極点',
  'Japan Extreme Points',
  '日本本土の最北端・最南端・最東端・最西端',
  '#3b82f6',
  '🧭',
  500,
  100
);

-- Insert 四極点 locations
insert into public.locations (category_id, name, name_en, prefecture, lat, lng)
values
  ('00000000-0000-0000-0000-000000000001', '宗谷岬', 'Cape Sōya', '北海道稚内市', 45.52278, 141.93639),
  ('00000000-0000-0000-0000-000000000001', '佐多岬', 'Cape Sata', '鹿児島県南大隅町', 30.99500, 130.66167),
  ('00000000-0000-0000-0000-000000000001', '納沙布岬', 'Cape Nosappu', '北海道根室市', 43.38528, 145.81861),
  ('00000000-0000-0000-0000-000000000001', '神崎鼻', 'Cape Kanzaki', '長崎県佐世保市', 33.21417, 129.55500);

-- Insert title for 四極点
insert into public.titles (name, description, category_id)
values ('四極探訪者', '日本本土の四極点を全て訪れた', '00000000-0000-0000-0000-000000000001');

-- Insert badge for 四極点
insert into public.badges (name, description, icon, category_id)
values ('四極点コンプリート', '日本本土四極点を全て制覇', '🧭', '00000000-0000-0000-0000-000000000001');
