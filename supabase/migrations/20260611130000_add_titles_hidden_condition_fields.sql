alter table public.titles
  add column if not exists is_hidden boolean not null default false,
  add column if not exists condition_type text,
  add column if not exists condition_value text;
