-- Rename categories table to themes
ALTER TABLE public.categories RENAME TO themes;

-- Rename category_id column in locations to theme_id
ALTER TABLE public.locations RENAME COLUMN category_id TO theme_id;

-- Rename category_id column in titles to theme_id
ALTER TABLE public.titles RENAME COLUMN category_id TO theme_id;

-- Rename index
ALTER INDEX IF EXISTS locations_category_id_idx RENAME TO locations_theme_id_idx;

-- Drop old RLS policies
DROP POLICY IF EXISTS "categories are public" ON public.themes;
DROP POLICY IF EXISTS "authenticated users can insert categories" ON public.themes;
DROP POLICY IF EXISTS "authenticated users can update categories" ON public.themes;
DROP POLICY IF EXISTS "authenticated users can delete categories" ON public.themes;

-- Recreate RLS policies with new names
CREATE POLICY "themes are public" ON public.themes FOR SELECT USING (true);
CREATE POLICY "authenticated users can insert themes" ON public.themes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can update themes" ON public.themes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated users can delete themes" ON public.themes FOR DELETE USING (auth.role() = 'authenticated');
