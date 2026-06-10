-- Rename themes.id → themes.uuid
ALTER TABLE public.themes RENAME COLUMN id TO uuid;

-- Add theme_id short-code column (nullable first)
ALTER TABLE public.themes ADD COLUMN theme_id text;

-- Set short codes for all existing themes
UPDATE public.themes SET theme_id = 'japan-extremes'    WHERE uuid = '00000000-0000-0000-0000-000000000001';
UPDATE public.themes SET theme_id = 'wakkanai-arctic'   WHERE uuid = '00000000-0000-0000-0000-000000000002';
UPDATE public.themes SET theme_id = 'national-conquest' WHERE uuid = '00000000-0000-0000-0000-000000000003';
UPDATE public.themes SET theme_id = 'japan-castles'     WHERE uuid = '00000000-0000-0000-0000-000000000004';
UPDATE public.themes SET theme_id = 'one-piece-statues' WHERE uuid = '9661460a-f26f-46fc-b024-337e26b48f17';

-- Make theme_id NOT NULL + UNIQUE
ALTER TABLE public.themes ALTER COLUMN theme_id SET NOT NULL;
ALTER TABLE public.themes ADD CONSTRAINT themes_theme_id_key UNIQUE (theme_id);
