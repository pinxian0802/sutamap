-- Admin policies for categories (insert, update, delete by authenticated users)
create policy "authenticated users can insert categories"
  on public.categories for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated users can update categories"
  on public.categories for update
  using (auth.role() = 'authenticated');

create policy "authenticated users can delete categories"
  on public.categories for delete
  using (auth.role() = 'authenticated');

-- Admin policies for locations (insert, update, delete by authenticated users)
create policy "authenticated users can insert locations"
  on public.locations for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated users can update locations"
  on public.locations for update
  using (auth.role() = 'authenticated');

create policy "authenticated users can delete locations"
  on public.locations for delete
  using (auth.role() = 'authenticated');
