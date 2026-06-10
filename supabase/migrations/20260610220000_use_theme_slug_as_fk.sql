-- Change locations.theme_id and titles.theme_id to reference themes(theme_id) text instead of themes(uuid)

-- 1. Add temporary text columns
ALTER TABLE public.locations ADD COLUMN theme_slug text;
ALTER TABLE public.titles    ADD COLUMN theme_slug text;

-- 2. Populate from join
UPDATE public.locations l
SET theme_slug = t.theme_id
FROM public.themes t
WHERE l.theme_id = t.uuid;

UPDATE public.titles ti
SET theme_slug = t.theme_id
FROM public.themes t
WHERE ti.theme_id = t.uuid;

-- 3. Drop old FK constraints and uuid columns
ALTER TABLE public.locations DROP CONSTRAINT locations_category_id_fkey;
ALTER TABLE public.locations DROP COLUMN theme_id;

ALTER TABLE public.titles DROP CONSTRAINT titles_category_id_fkey;
ALTER TABLE public.titles DROP COLUMN theme_id;

-- 4. Rename new columns
ALTER TABLE public.locations RENAME COLUMN theme_slug TO theme_id;
ALTER TABLE public.titles    RENAME COLUMN theme_slug TO theme_id;

-- 5. Add NOT NULL and FK to themes(theme_id)
ALTER TABLE public.locations ALTER COLUMN theme_id SET NOT NULL;
ALTER TABLE public.locations ADD CONSTRAINT locations_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES public.themes(theme_id) ON DELETE CASCADE;

ALTER TABLE public.titles ADD CONSTRAINT titles_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES public.themes(theme_id) ON DELETE CASCADE;
