-- Rename 稚内極北生活圏 → 最北端巡礼 and expand locations to 11
UPDATE public.themes
SET
  name        = '最北端巡礼',
  name_en     = 'Northernmost Pilgrimage',
  name_zh     = '最北端巡禮',
  description = '日本各地の「最北端」を巡る特別な旅。碑から神社、自販機まで、すべての最北端を制覇せよ'
WHERE theme_id = 'wakkanai-arctic';

UPDATE public.titles
SET
  name        = '最北端巡礼者',
  name_en     = 'Northernmost Pilgrim',
  name_zh     = '最北端巡禮者',
  description = '日本最北端のすべてのスポットを制覇した'
WHERE theme_id = 'wakkanai-arctic';

UPDATE public.locations
SET
  name    = '日本最北端の駅',
  name_en = 'Northernmost Station in Japan',
  name_zh = '日本最北端車站'
WHERE theme_id = 'wakkanai-arctic' AND name = 'JR稚内駅';

INSERT INTO public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
VALUES
  ('wakkanai-arctic', '日本最北端の碑',         'Northernmost Point of Japan Monument', '日本最北端之碑',           '北海道稚内市', 45.5229095, 141.9365885),
  ('wakkanai-arctic', '最北端食堂',             'Northernmost Restaurant',              '最北端食堂',               '北海道稚内市', 45.5220472, 141.9373524),
  ('wakkanai-arctic', '出光昭和シェル 宗谷岬SS','Idemitsu Showa Shell Soya Misaki',     '出光昭和殼牌石油宗谷岬站',  '北海道稚内市', 45.521761,  141.939492),
  ('wakkanai-arctic', '日本最北端の公衆トイレ', 'Northernmost Public Restroom in Japan','日本最北端公廁',            '北海道稚内市', 45.522481,  141.9376339),
  ('wakkanai-arctic', '宗谷岬郵便局',           'Soya Misaki Post Office',              '宗谷岬郵局',               '北海道稚内市', 45.5160376, 141.944949),
  ('wakkanai-arctic', 'ローソン 稚内栄5丁目店', 'Lawson Wakkanai Sakae 5-chome',        '羅森稚內榮五丁目店',        '北海道稚内市', 45.38661,   141.701931),
  ('wakkanai-arctic', '日本最北端の自動販売機', 'Northernmost Vending Machine in Japan','日本最北端自動販賣機',      '北海道稚内市', 45.522204,  141.937985),
  ('wakkanai-arctic', '北門神社',               'Kitamon Shrine',                       '北門神社',                 '北海道稚内市', 45.420093,  141.6712968);
