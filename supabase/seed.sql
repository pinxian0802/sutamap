-- Insert themes
insert into public.themes (theme_id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  'japan-extremes',
  '日本四極',
  'Japan Extreme Points',
  '日本四極',
  '日本最北端、最南端、最東端、最西端の地を巡る旅',
  '#3b82f6',
  '🧭',
  500,
  100
);

insert into public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('japan-extremes', '宗谷岬', 'Cape Sōya', '宗谷岬', '北海道稚内市', 45.52278, 141.93639),
  ('japan-extremes', '佐多岬', 'Cape Sata', '佐多岬', '鹿児島県南大隅町', 30.99500, 130.66167),
  ('japan-extremes', '納沙布岬', 'Cape Nosappu', '納沙布岬', '北海道根室市', 43.38528, 145.81861),
  ('japan-extremes', '神崎鼻', 'Cape Kanzaki', '神崎鼻', '長崎県小値賀町', 33.21417, 129.55500);

insert into public.titles (name, name_en, name_zh, description, theme_id)
values ('四極踏破者', 'Four Extremes Explorer', '四極踏破者', '日本の端を四か所制覇した', 'japan-extremes');

-- ============================================================
-- 最北端巡礼（11選）
-- ============================================================
insert into public.themes (theme_id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  'wakkanai-arctic',
  '最北端巡礼',
  'Northernmost Pilgrimage',
  '最北端巡禮',
  '日本各地の「最北端」を巡る特別な旅。碑から神社、自販機まで、すべての最北端を制覇せよ',
  '#06b6d4',
  '❄️',
  200,
  80
);

insert into public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('wakkanai-arctic', 'マクドナルド 40号稚内店',      'McDonald''s Route 40 Wakkanai',        '麥當勞40號稚內店',         '北海道稚内市', 45.39699,   141.68199),
  ('wakkanai-arctic', 'セイコーマート 富磯店',         'Seicomart Tomiiso',                    'Seicomart富磯店',          '北海道稚内市', 45.40222,   141.69333),
  ('wakkanai-arctic', '日本最北端の駅',               'Northernmost Station in Japan',        '日本最北端車站',            '北海道稚内市', 45.41611,   141.67278),
  ('wakkanai-arctic', '日本最北端の碑',               'Northernmost Point of Japan Monument', '日本最北端之碑',            '北海道稚内市', 45.5229095, 141.9365885),
  ('wakkanai-arctic', '最北端食堂',                   'Northernmost Restaurant',              '最北端食堂',               '北海道稚内市', 45.5220472, 141.9373524),
  ('wakkanai-arctic', '出光昭和シェル 宗谷岬SS',      'Idemitsu Showa Shell Soya Misaki',     '出光昭和殼牌石油宗谷岬站',  '北海道稚内市', 45.521761,  141.939492),
  ('wakkanai-arctic', '日本最北端の公衆トイレ',       'Northernmost Public Restroom in Japan','日本最北端公廁',            '北海道稚内市', 45.522481,  141.9376339),
  ('wakkanai-arctic', '宗谷岬郵便局',                 'Soya Misaki Post Office',              '宗谷岬郵局',               '北海道稚内市', 45.5160376, 141.944949),
  ('wakkanai-arctic', 'ローソン 稚内栄5丁目店',       'Lawson Wakkanai Sakae 5-chome',        '羅森稚內榮五丁目店',        '北海道稚内市', 45.38661,   141.701931),
  ('wakkanai-arctic', '日本最北端の自動販売機',       'Northernmost Vending Machine in Japan','日本最北端自動販賣機',      '北海道稚内市', 45.522204,  141.937985),
  ('wakkanai-arctic', '北門神社',                     'Kitamon Shrine',                       '北門神社',                 '北海道稚内市', 45.420093,  141.6712968);

insert into public.titles (name, name_en, name_zh, description, theme_id)
values ('最北端巡礼者', 'Northernmost Pilgrim', '最北端巡禮者', '日本最北端のすべてのスポットを制覇した', 'wakkanai-arctic');

-- ============================================================
-- 全国制覇（47都道府県）
-- ============================================================
insert into public.themes (theme_id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  'national-conquest',
  '全国制覇',
  'National Conquest',
  '全国制覇',
  '全国47都道府県の代表地点を訪れて日本を制覇しよう',
  '#e11d48',
  '🗾',
  200,
  20
);

insert into public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
values
  -- 北海道・東北
  ('national-conquest', '北海道', 'Hokkaido', '北海道', '北海道', 43.2203266, 142.8634737),
  ('national-conquest', '青森県', 'Aomori', '青森県', '青森県', 40.7657077, 140.9175879),
  ('national-conquest', '岩手県', 'Iwate', '岩手県', '岩手県', 39.5832989, 141.2534574),
  ('national-conquest', '宮城県', 'Miyagi', '宮城県', '宮城県', 38.6306120, 141.1193048),
  ('national-conquest', '秋田県', 'Akita', '秋田県', '秋田県', 40.1376293, 140.3343410),
  ('national-conquest', '山形県', 'Yamagata', '山形県', '山形県', 38.5370564, 140.1435198),
  ('national-conquest', '福島県', 'Fukushima', '福島県', '福島県', 37.3834373, 140.1832516),
  -- 関東
  ('national-conquest', '茨城県', 'Ibaraki', '茨城県', '茨城県', 36.2193571, 140.1832516),
  ('national-conquest', '栃木県', 'Tochigi', '栃木県', '栃木県', 36.6714739, 139.8547266),
  ('national-conquest', '群馬県', 'Gunma', '群馬県', '群馬県', 36.5605388, 138.8799972),
  ('national-conquest', '埼玉県', 'Saitama', '埼玉県', '埼玉県', 35.9962513, 139.4466005),
  ('national-conquest', '千葉県', 'Chiba', '千葉県', '千葉県', 35.3354155, 140.1832516),
  ('national-conquest', '東京都', 'Tokyo', '東京都', '東京都', 35.6764225, 139.6500270),
  ('national-conquest', '神奈川県', 'Kanagawa', '神奈川県', '神奈川県', 35.4913535, 139.2841430),
  -- 中部
  ('national-conquest', '新潟県', 'Niigata', '新潟県', '新潟県', 37.5178386, 138.9269794),
  ('national-conquest', '富山県', 'Toyama', '富山県', '富山県', 36.6958266, 137.2137071),
  ('national-conquest', '石川県', 'Ishikawa', '石川県', '石川県', 36.3260317, 136.5289653),
  ('national-conquest', '福井県', 'Fukui', '福井県', '福井県', 35.8962270, 136.2111579),
  ('national-conquest', '山梨県', 'Yamanashi', '山梨県', '山梨県', 35.6635113, 138.6388879),
  ('national-conquest', '長野県', 'Nagano', '長野県', '長野県', 36.1543941, 137.9218204),
  ('national-conquest', '岐阜県', 'Gifu', '岐阜県', '岐阜県', 35.7437491, 136.9805103),
  ('national-conquest', '静岡県', 'Shizuoka', '静岡県', '静岡県', 35.0929397, 138.3190276),
  ('national-conquest', '愛知県', 'Aichi', '愛知県', '愛知県', 35.0182505, 137.2923893),
  -- 近畿
  ('national-conquest', '三重県', 'Mie', '三重県', '三重県', 33.8143901, 136.0487047),
  ('national-conquest', '滋賀県', 'Shiga', '滋賀県', '滋賀県', 35.3292014, 136.0563212),
  ('national-conquest', '京都府', 'Kyoto', '京都府', '京都府', 35.1566609, 135.5251982),
  ('national-conquest', '大阪府', 'Osaka', '大阪府', '大阪府', 34.6413315, 135.5629394),
  ('national-conquest', '兵庫県', 'Hyogo', '兵庫県', '兵庫県', 34.8579518, 134.5453787),
  ('national-conquest', '奈良県', 'Nara', '奈良県', '奈良県', 34.2975528, 135.8279734),
  ('national-conquest', '和歌山県', 'Wakayama', '和歌山県', '和歌山県', 33.9480914, 135.3745358),
  -- 中国・四国
  ('national-conquest', '鳥取県', 'Tottori', '鳥取県', '鳥取県', 35.3573161, 133.4066618),
  ('national-conquest', '島根県', 'Shimane', '島根県', '島根県', 35.1244094, 132.6293446),
  ('national-conquest', '岡山県', 'Okayama', '岡山県', '岡山県', 34.8963407, 133.6375314),
  ('national-conquest', '広島県', 'Hiroshima', '広島県', '広島県', 34.8823408, 133.0194897),
  ('national-conquest', '山口県', 'Yamaguchi', '山口県', '山口県', 34.2796769, 131.5212742),
  ('national-conquest', '徳島県', 'Tokushima', '徳島県', '徳島県', 33.9419655, 134.3236557),
  ('national-conquest', '香川県', 'Kagawa', '香川県', '香川県', 34.2225915, 134.0199152),
  ('national-conquest', '愛媛県', 'Ehime', '愛媛県', '愛媛県', 33.6025306, 132.7857583),
  ('national-conquest', '高知県', 'Kochi', '高知県', '高知県', 33.5481246, 133.2521507),
  -- 九州・沖縄
  ('national-conquest', '福岡県', 'Fukuoka', '福岡県', '福岡県', 33.5662559, 130.7158570),
  ('national-conquest', '佐賀県', 'Saga', '佐賀県', '佐賀県', 33.3078371, 130.2271243),
  ('national-conquest', '長崎県', 'Nagasaki', '長崎県', '長崎県', 33.2488525, 129.6930912),
  ('national-conquest', '熊本県', 'Kumamoto', '熊本県', '熊本県', 32.8594427, 130.7969149),
  ('national-conquest', '大分県', 'Oita', '大分県', '大分県', 33.1589299, 131.3611121),
  ('national-conquest', '宮崎県', 'Miyazaki', '宮崎県', '宮崎県', 32.6036022, 131.4412510),
  ('national-conquest', '鹿児島県', 'Kagoshima', '鹿児島県', '鹿児島県', 31.3911958, 130.8778586),
  ('national-conquest', '沖縄県', 'Okinawa', '沖縄県', '沖縄県', 26.1201911, 127.7025012);

insert into public.titles (name, name_en, name_zh, description, theme_id)
values ('全国制覇', 'National Conquest', '全国制覇', '47都道府県すべてに足跡を残した', 'national-conquest');

-- ============================================================
-- 日本百名城
-- ============================================================
insert into public.themes (theme_id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  'japan-castles',
  '日本百名城',
  'Japan''s 100 Famous Castles',
  '日本百名城',
  '公益財団法人日本城郭協会が選定した100の名城を巡る旅',
  '#991b1b',
  '🏯',
  300,
  50
);

insert into public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('japan-castles', '根室半島チャシ跡群', 'Nemuro Peninsula Chashi Ruins', '根室半島查希遺址群', '北海道根室市', 43.3887273, 145.7824096),
  ('japan-castles', '五稜郭', 'Goryokaku Fort', '五稜郭', '北海道函館市', 41.7969245, 140.7567838),
  ('japan-castles', '松前城', 'Matsumae Castle', '松前城', '北海道松前郡', 41.4298799, 140.1084293),
  ('japan-castles', '弘前城', 'Hirosaki Castle', '弘前城', '青森県弘前市', 40.6079159, 140.4636654),
  ('japan-castles', '根城', 'Ne Castle', '根城', '青森県八戸市', 40.5062719, 141.4607934),
  ('japan-castles', '盛岡城', 'Morioka Castle', '盛岡城', '岩手県盛岡市', 39.6999975, 141.150821),
  ('japan-castles', '多賀城', 'Tagajo', '多賀城', '宮城県多賀城市', 38.2938504, 141.0044375),
  ('japan-castles', '仙台城', 'Sendai Castle', '仙台城', '宮城県仙台市', 38.2534138, 140.8561276),
  ('japan-castles', '久保田城', 'Kubota Castle', '久保田城', '秋田県秋田市', 39.7218144, 140.1236925),
  ('japan-castles', '山形城', 'Yamagata Castle', '山形城', '山形県山形市', 38.2555275, 140.3277697),
  ('japan-castles', '二本松城', 'Nihonmatsu Castle', '二本松城', '福島県二本松市', 37.5986946, 140.4296849),
  ('japan-castles', '会津若松城', 'Aizuwakamatsu Castle', '会津若松城', '福島県会津若松市', 37.4877934, 139.9295015),
  ('japan-castles', '白河小峰城', 'Shirakawa Komine Castle', '白河小峰城', '福島県白河市', 37.1324067, 140.2136919),
  ('japan-castles', '水戸城', 'Mito Castle', '水戸城', '茨城県水戸市', 36.3742982, 140.4807827),
  ('japan-castles', '足利氏館', 'Ashikaga Clan Residence', '足利氏館', '栃木県足利市', 36.3376851, 139.4519998),
  ('japan-castles', '箕輪城', 'Minowa Castle', '箕輪城', '群馬県高崎市', 36.40495, 138.950958),
  ('japan-castles', '金山城', 'Kanayama Castle', '金山城', '群馬県太田市', 36.3169465, 139.3778298),
  ('japan-castles', '鉢形城', 'Hachigata Castle', '鉢形城', '埼玉県寄居町', 36.1073149, 139.1933605),
  ('japan-castles', '川越城', 'Kawagoe Castle', '川越城', '埼玉県川越市', 35.9243955, 139.4916826),
  ('japan-castles', '佐倉城', 'Sakura Castle', '佐倉城', '千葉県佐倉市', 35.7223254, 140.2159635),
  ('japan-castles', '江戸城', 'Edo Castle', '江戸城', '東京都千代田区', 35.6883712, 139.7544177),
  ('japan-castles', '八王子城', 'Hachioji Castle', '八王子城', '東京都八王子市', 35.652617, 139.2565145),
  ('japan-castles', '小田原城', 'Odawara Castle', '小田原城', '神奈川県小田原市', 35.2509493, 139.1535136),
  ('japan-castles', '新発田城', 'Shibata Castle', '新発田城', '新潟県新発田市', 37.9547806, 139.3260149),
  ('japan-castles', '春日山城', 'Kasugayama Castle', '春日山城', '新潟県上越市', 37.1466546, 138.2055489),
  ('japan-castles', '松代城', 'Matsushiro Castle', '松代城', '長野県長野市', 36.5663607, 138.1961698),
  ('japan-castles', '上田城', 'Ueda Castle', '上田城', '長野県上田市', 36.404377, 138.2449512),
  ('japan-castles', '小諸城', 'Komoro Castle', '小諸城', '長野県小諸市', 36.3271098, 138.4175464),
  ('japan-castles', '松本城', 'Matsumoto Castle', '松本城', '長野県松本市', 36.238653, 137.9688674),
  ('japan-castles', '高遠城', 'Takato Castle', '高遠城', '長野県伊那市', 35.8331601, 138.0623625),
  ('japan-castles', '武田氏館', 'Takeda Clan Residence', '武田氏館', '山梨県甲府市', 35.6866849, 138.5772796),
  ('japan-castles', '甲府城', 'Kofu Castle', '甲府城', '山梨県甲府市', 35.6653429, 138.5713936),
  ('japan-castles', '高岡城', 'Takaoka Castle', '高岡城', '富山県高岡市', 36.7493267, 137.0207843),
  ('japan-castles', '七尾城', 'Nanao Castle', '七尾城', '石川県七尾市', 37.0089871, 136.9846774),
  ('japan-castles', '金沢城', 'Kanazawa Castle', '金沢城', '石川県金沢市', 36.5659609, 136.6596084),
  ('japan-castles', '丸岡城', 'Maruoka Castle', '丸岡城', '福井県坂井市', 36.1524034, 136.2723026),
  ('japan-castles', '一乗谷城', 'Ichijodani Castle', '一乗谷城', '福井県福井市', 35.9994633, 136.2959322),
  ('japan-castles', '岩村城', 'Iwamura Castle', '岩村城', '岐阜県恵那市', 35.3599583, 137.4513221),
  ('japan-castles', '岐阜城', 'Gifu Castle', '岐阜城', '岐阜県岐阜市', 35.433918, 136.7820713),
  ('japan-castles', '山中城', 'Yamanaka Castle', '山中城', '静岡県三島市', 35.1561276, 138.9920517),
  ('japan-castles', '駿府城', 'Sunpu Castle', '駿府城', '静岡県静岡市', 34.9789981, 138.3831214),
  ('japan-castles', '掛川城', 'Kakegawa Castle', '掛川城', '静岡県掛川市', 34.7752055, 138.0139033),
  ('japan-castles', '犬山城', 'Inuyama Castle', '犬山城', '愛知県犬山市', 35.3883604, 136.9391766),
  ('japan-castles', '名古屋城', 'Nagoya Castle', '名古屋城', '愛知県名古屋市', 35.1847501, 136.8996883),
  ('japan-castles', '岡崎城', 'Okazaki Castle', '岡崎城', '愛知県岡崎市', 34.9564952, 137.1592798),
  ('japan-castles', '長篠城', 'Nagashino Castle', '長篠城', '愛知県新城市', 34.9226355, 137.5597906),
  ('japan-castles', '伊賀上野城', 'Iga Ueno Castle', '伊賀上野城', '三重県伊賀市', 34.7701586, 136.1270173),
  ('japan-castles', '松坂城', 'Matsusaka Castle', '松坂城', '三重県松阪市', 34.5759323, 136.5258102),
  ('japan-castles', '小谷城', 'Odani Castle', '小谷城', '滋賀県長浜市', 35.459359, 136.2770762),
  ('japan-castles', '彦根城', 'Hikone Castle', '彦根城', '滋賀県彦根市', 35.276452, 136.251846),
  ('japan-castles', '安土城', 'Azuchi Castle', '安土城', '滋賀県近江八幡市', 35.1558183, 136.1395424),
  ('japan-castles', '観音寺城', 'Kannonji Castle', '観音寺城', '滋賀県近江八幡市', 35.1456393, 136.1577287),
  ('japan-castles', '二条城', 'Nijo Castle', '二条城', '京都府京都市', 35.0157791, 135.7516133),
  ('japan-castles', '大阪城', 'Osaka Castle', '大阪城', '大阪府大阪市', 34.6872571, 135.5258546),
  ('japan-castles', '千早城', 'Chihaya Castle', '千早城', '大阪府千早赤阪村', 34.4161619, 135.6526744),
  ('japan-castles', '竹田城', 'Takeda Castle', '竹田城', '兵庫県朝来市', 35.3004745, 134.8290454),
  ('japan-castles', '篠山城', 'Sasayama Castle', '篠山城', '兵庫県丹波篠山市', 35.074126, 135.2210411),
  ('japan-castles', '明石城', 'Akashi Castle', '明石城', '兵庫県明石市', 34.6523517, 134.9910952),
  ('japan-castles', '姫路城', 'Himeji Castle', '姫路城', '兵庫県姫路市', 34.839449, 134.6939047),
  ('japan-castles', '赤穂城', 'Ako Castle', '赤穂城', '兵庫県赤穂市', 34.7464518, 134.3890573),
  ('japan-castles', '高取城', 'Takatori Castle', '高取城', '奈良県高取町', 34.4294957, 135.8268431),
  ('japan-castles', '和歌山城', 'Wakayama Castle', '和歌山城', '和歌山県和歌山市', 34.2278094, 135.1720412),
  ('japan-castles', '鳥取城', 'Tottori Castle', '鳥取城', '鳥取県鳥取市', 35.5102686, 134.2409327),
  ('japan-castles', '松江城', 'Matsue Castle', '松江城', '島根県松江市', 35.4751335, 133.0506783),
  ('japan-castles', '月山富田城', 'Gassan Toda Castle', '月山富田城', '島根県安来市', 35.3608051, 133.1852653),
  ('japan-castles', '津和野城', 'Tsuwano Castle', '津和野城', '島根県津和野町', 34.4617445, 131.765431),
  ('japan-castles', '津山城', 'Tsuyama Castle', '津山城', '岡山県津山市', 35.0625464, 134.0052051),
  ('japan-castles', '備中松山城', 'Bicchu Matsuyama Castle', '備中松山城', '岡山県高梁市', 34.8089937, 133.6219844),
  ('japan-castles', '鬼ノ城', 'Kinojo', '鬼城', '岡山県総社市', 34.7259441, 133.7631151),
  ('japan-castles', '岡山城', 'Okayama Castle', '岡山城', '岡山県岡山市', 34.6651878, 133.9360657),
  ('japan-castles', '福山城', 'Fukuyama Castle', '福山城', '広島県福山市', 34.4906563, 133.3611845),
  ('japan-castles', '吉田郡山城', 'Yoshida Koriyama Castle', '吉田郡山城', '広島県安芸高田市', 34.6700783, 132.710575),
  ('japan-castles', '広島城', 'Hiroshima Castle', '広島城', '広島県広島市', 34.4027456, 132.4591055),
  ('japan-castles', '岩国城', 'Iwakuni Castle', '岩国城', '山口県岩国市', 34.175242, 132.1741976),
  ('japan-castles', '萩城', 'Hagi Castle', '萩城', '山口県萩市', 34.4186854, 131.3833634),
  ('japan-castles', '徳島城', 'Tokushima Castle', '徳島城', '徳島県徳島市', 34.0754535, 134.5548774),
  ('japan-castles', '高松城', 'Takamatsu Castle', '高松城', '香川県高松市', 34.3503157, 134.0516188),
  ('japan-castles', '丸亀城', 'Marugame Castle', '丸亀城', '香川県丸亀市', 34.2859887, 133.800375),
  ('japan-castles', '今治城', 'Imabari Castle', '今治城', '愛媛県今治市', 34.0633885, 133.0067548),
  ('japan-castles', '湯築城', 'Yuzuki Castle', '湯築城', '愛媛県松山市', 33.8487202, 132.7866197),
  ('japan-castles', '松山城', 'Matsuyama Castle', '松山城', '愛媛県松山市', 33.8455768, 132.7655346),
  ('japan-castles', '大洲城', 'Ozu Castle', '大洲城', '愛媛県大洲市', 33.5095497, 132.5413122),
  ('japan-castles', '宇和島城', 'Uwajima Castle', '宇和島城', '愛媛県宇和島市', 33.2194492, 132.565284),
  ('japan-castles', '高知城', 'Kochi Castle', '高知城', '高知県高知市', 33.5608125, 133.5314844),
  ('japan-castles', '福岡城', 'Fukuoka Castle', '福岡城', '福岡県福岡市', 33.5852452, 130.3832159),
  ('japan-castles', '大野城', 'Ono Castle', '大野城', '福岡県大野城市', 33.538528, 130.507333),
  ('japan-castles', '名護屋城', 'Nagoya Castle (Hizen)', '名護屋城', '佐賀県唐津市', 33.5306695, 129.8690516),
  ('japan-castles', '吉野ヶ里遺跡', 'Yoshinogari Ruins', '吉野ヶ里遺跡', '佐賀県吉野ヶ里町', 33.3239366, 130.3887596),
  ('japan-castles', '佐賀城', 'Saga Castle', '佐賀城', '佐賀県佐賀市', 33.2453424, 130.3025805),
  ('japan-castles', '平戸城', 'Hirado Castle', '平戸城', '長崎県平戸市', 33.3685455, 129.5575561),
  ('japan-castles', '島原城', 'Shimabara Castle', '島原城', '長崎県島原市', 32.7892283, 130.3673433),
  ('japan-castles', '熊本城', 'Kumamoto Castle', '熊本城', '熊本県熊本市', 32.8061859, 130.7058335),
  ('japan-castles', '人吉城', 'Hitoyoshi Castle', '人吉城', '熊本県人吉市', 32.2111674, 130.766571),
  ('japan-castles', '大分府内城', 'Oita Funai Castle', '大分府内城', '大分県大分市', 33.2405347, 131.6115895),
  ('japan-castles', '岡城', 'Oka Castle', '岡城', '大分県竹田市', 32.9682641, 131.4063448),
  ('japan-castles', '飫肥城', 'Obi Castle', '飫肥城', '宮崎県日南市', 31.6281567, 131.3511418),
  ('japan-castles', '鹿児島城', 'Kagoshima Castle', '鹿児島城', '鹿児島県鹿児島市', 31.5988687, 130.5547801),
  ('japan-castles', '今帰仁城', 'Nakijin Castle', '今帰仁城', '沖縄県今帰仁村', 26.6912793, 127.9290226),
  ('japan-castles', '中城城', 'Nakagusuku Castle', '中城城', '沖縄県中城村', 26.2835007, 127.7996708),
  ('japan-castles', '首里城', 'Shuri Castle', '首里城', '沖縄県那覇市', 26.2170449, 127.7194833);

insert into public.titles (name, name_en, name_zh, description, theme_id)
values ('天下統一者', 'Unifier of the Realm', '天下統一者', '日本百名城をすべて制覇した', 'japan-castles');

-- ============================================================
-- ワンピース像
-- ============================================================
insert into public.themes (theme_id, name, name_en, name_zh, description, color, icon, checkin_radius_meters, xp_per_checkin)
values (
  'one-piece-statues',
  'ワンピース像',
  'One Piece Statues',
  '海賊王雕像',
  '熊本県にあるONE PIECEキャラクターの銅像を巡る旅',
  '#e11d48',
  '☠️🏴‍☠️',
  200,
  80
);

insert into public.locations (theme_id, name, name_en, name_zh, prefecture, lat, lng)
values
  ('one-piece-statues', 'ルフィの銅像', 'Luffy Statue', '路飛銅像', '熊本県', 32.789011, 130.7413031),
  ('one-piece-statues', 'チョッパーの像', 'Chopper Statue', '喬巴銅像', '熊本県', 32.776109, 130.7503989),
  ('one-piece-statues', 'サンジの像', 'Sanji Statue', '山治銅像', '熊本県', 32.7869618, 130.8234726),
  ('one-piece-statues', 'ゾロの像', 'Zoro Statue', '索隆銅像', '熊本県', 32.8770961, 130.8711613),
  ('one-piece-statues', 'ウソップの像', 'Usopp Statue', '烏索普銅像', '熊本県', 32.937002, 131.0803069),
  ('one-piece-statues', 'フランキーの像', 'Franky Statue', '弗蘭奇銅像', '熊本県', 32.8192246, 131.1226302),
  ('one-piece-statues', 'ナミの像', 'Nami Statue', '娜美銅像', '熊本県', 32.8429066, 130.9390326),
  ('one-piece-statues', 'ブルックの像', 'Brook Statue', '布魯克銅像', '熊本県', 32.714009, 130.8051029),
  ('one-piece-statues', 'ジンベエの像', 'Jinbe Statue', '甚平銅像', '熊本県', 32.704119, 130.5813366),
  ('one-piece-statues', 'ロビンの像', 'Robin Statue', '羅賓銅像', '熊本県', 32.8911934, 130.9958042);

insert into public.titles (name, name_en, name_zh, description, theme_id)
values ('ワンピース像制覇', 'One Piece Statues', '海賊王雕像制覇', '熊本のONE PIECEキャラクター銅像をすべて巡った', 'one-piece-statues');

-- ============================================================
-- RPC Functions
-- ============================================================

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
