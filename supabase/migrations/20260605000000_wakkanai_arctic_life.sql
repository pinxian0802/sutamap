-- Add name_zh column to categories, locations, titles, badges
alter table public.categories add column if not exists name_zh text not null default '';
alter table public.locations add column if not exists name_zh text;
alter table public.titles add column if not exists name_en text;
alter table public.titles add column if not exists name_zh text;
alter table public.badges add column if not exists name_en text;
alter table public.badges add column if not exists name_zh text;

-- Backfill existing 四極点 data with zh names
update public.categories set name_zh = '日本四極點' where id = '00000000-0000-0000-0000-000000000001';

update public.locations set name_zh = '宗谷岬' where name = '宗谷岬';
update public.locations set name_zh = '佐多岬' where name = '佐多岬';
update public.locations set name_zh = '納沙布岬' where name = '納沙布岬';
update public.locations set name_zh = '神崎鼻' where name = '神崎鼻';

update public.titles set name_en = 'Four Extremes Explorer', name_zh = '四極探訪者'
  where category_id = '00000000-0000-0000-0000-000000000001';

update public.badges set name_en = 'Four Extremes Complete', name_zh = '四極點全制霸'
  where category_id = '00000000-0000-0000-0000-000000000001';

-- 稚内極北生活圏（極北一日遊）
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
