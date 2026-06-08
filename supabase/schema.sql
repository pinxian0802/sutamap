-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories (主題)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text not null,
  name_zh text not null default '',
  description text,
  color text not null default '#3b82f6',
  icon text not null default '📍',
  checkin_radius_meters int not null default 500,
  xp_per_checkin int not null default 10,
  created_at timestamptz not null default now()
);

-- Locations (地點)
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  name_en text,
  name_zh text,
  prefecture text,
  lat double precision not null,
  lng double precision not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index locations_category_id_idx on public.locations(category_id);
create index locations_latlng_idx on public.locations(lat, lng);

-- Titles (稱號定義)
create table public.titles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  name_zh text,
  description text,
  category_id uuid references public.categories(id) on delete cascade
);

-- User Profiles
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  total_xp int not null default 0,
  level int not null default 1,
  active_title_id uuid references public.titles(id),
  created_at timestamptz not null default now()
);

-- Check-ins (打卡記錄)
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  photo_url text not null,
  checkin_lat double precision not null,
  checkin_lng double precision not null,
  distance_meters int not null,
  is_first boolean not null default false,
  created_at timestamptz not null default now()
);

create index checkins_user_id_idx on public.checkins(user_id);
create index checkins_location_id_idx on public.checkins(location_id);
create unique index checkins_first_unique on public.checkins(user_id, location_id) where is_first = true;

-- User Titles
create table public.user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, title_id)
);

-- Friendships
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique(requester_id, addressee_id)
);

create index friendships_addressee_idx on public.friendships(addressee_id);

-- RLS Policies
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.user_titles enable row level security;
alter table public.friendships enable row level security;
alter table public.titles enable row level security;

-- Public read access for categories, locations, titles
create policy "categories are public" on public.categories for select using (true);
create policy "locations are public" on public.locations for select using (true);
create policy "titles are public" on public.titles for select using (true);

-- Admin write access for categories and locations
create policy "authenticated users can insert categories" on public.categories for insert with check (auth.role() = 'authenticated');
create policy "authenticated users can update categories" on public.categories for update using (auth.role() = 'authenticated');
create policy "authenticated users can delete categories" on public.categories for delete using (auth.role() = 'authenticated');
create policy "authenticated users can insert locations" on public.locations for insert with check (auth.role() = 'authenticated');
create policy "authenticated users can update locations" on public.locations for update using (auth.role() = 'authenticated');
create policy "authenticated users can delete locations" on public.locations for delete using (auth.role() = 'authenticated');

-- User profiles: public read, own write
create policy "profiles are public" on public.user_profiles for select using (true);
create policy "users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- Checkins: public read, authenticated insert
create policy "checkins are public" on public.checkins for select using (true);
create policy "authenticated users can insert checkins" on public.checkins for insert with check (auth.uid() = user_id);

-- User titles: public read, system insert (via service role)
create policy "user titles are public" on public.user_titles for select using (true);

-- Friendships: users see their own
create policy "users see own friendships" on public.friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "users can request friendship" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "addressee can update friendship status" on public.friendships for update using (auth.uid() = addressee_id);

-- Function: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
