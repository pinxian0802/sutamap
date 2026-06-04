# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the sutamap Next.js project with Supabase auth, database schema, seed data for 四極点, and a working login/register flow.

**Architecture:** Next.js 15 App Router with TypeScript. Supabase handles auth and database. Cloudflare R2 handles photo storage (configured here but used in Plan 2). All Supabase queries use the server client in Server Components and the browser client in Client Components.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (Auth + PostgreSQL), Cloudflare R2 (env config only in this plan)

---

## File Structure

```
sutamap/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with Supabase session provider
│   │   ├── page.tsx                 # Home page (redirect to /map)
│   │   └── auth/
│   │       ├── login/page.tsx       # Login page
│   │       ├── register/page.tsx    # Register page
│   │       └── callback/route.ts    # Supabase OAuth callback
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       ├── server.ts            # Server Supabase client
│   │       └── middleware.ts        # Session refresh middleware
│   └── types/
│       └── database.ts              # Generated DB types
├── supabase/
│   ├── migrations/
│   │   └── 20260604000000_initial_schema.sql
│   └── seed.sql                     # 四極点 seed data
├── middleware.ts                    # Next.js middleware for auth
├── .env.local                       # Environment variables
└── public/
    ├── manifest.json                # PWA manifest
    └── icons/                       # PWA icons
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts` (via create-next-app)
- Create: `.env.local`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:\Users\Panda\Desktop\sutamap
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

Expected: Next.js project files created in sutamap directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr leaflet @types/leaflet exifr browser-image-compression
npm install -D supabase
```

- [ ] **Step 3: Install Shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input label card form toast
```

- [ ] **Step 4: Initialize git**

```bash
git init
git add .
git commit -m "chore: initial Next.js project setup"
```

---

## Task 2: Environment Variables

**Files:**
- Create: `.env.local`
- Create: `.env.local.example`

- [ ] **Step 1: Create `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=sutamap-photos
R2_PUBLIC_URL=https://your-r2-public-url.r2.dev
```

Fill in values from:
- Supabase: Project Settings → API
- Cloudflare R2: R2 → Manage R2 API Tokens

- [ ] **Step 2: Create `.env.local.example`** (same content, empty values)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

- [ ] **Step 3: Verify .gitignore includes .env.local**

`.gitignore` should already have `.env.local` from create-next-app. Verify:

```bash
grep ".env.local" .gitignore
```

Expected output: `.env.local`

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create browser client** `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client** `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware helper** `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}
```

- [ ] **Step 4: Create Next.js middleware** `middleware.ts`

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Task 4: Database Schema

**Files:**
- Create: `supabase/migrations/20260604000000_initial_schema.sql`

- [ ] **Step 1: Write migration SQL** `supabase/migrations/20260604000000_initial_schema.sql`

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories (主題)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text not null,
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
  description text,
  category_id uuid references public.categories(id) on delete cascade
);

-- Badges (徽章定義)
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text not null default '🏅',
  category_id uuid references public.categories(id) on delete cascade
);

-- User Profiles
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
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

-- User Badges
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
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
alter table public.user_badges enable row level security;
alter table public.friendships enable row level security;
alter table public.titles enable row level security;
alter table public.badges enable row level security;

-- Public read access for categories, locations, titles, badges
create policy "categories are public" on public.categories for select using (true);
create policy "locations are public" on public.locations for select using (true);
create policy "titles are public" on public.titles for select using (true);
create policy "badges are public" on public.badges for select using (true);

-- User profiles: public read, own write
create policy "profiles are public" on public.user_profiles for select using (true);
create policy "users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- Checkins: public read, authenticated insert
create policy "checkins are public" on public.checkins for select using (true);
create policy "authenticated users can insert checkins" on public.checkins for insert with check (auth.uid() = user_id);

-- User titles/badges: public read, system insert (via service role)
create policy "user titles are public" on public.user_titles for select using (true);
create policy "user badges are public" on public.user_badges for select using (true);

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
```

- [ ] **Step 2: Apply migration to Supabase**

Go to Supabase Dashboard → SQL Editor, paste and run the migration SQL.

Expected: All tables created without errors.

---

## Task 5: Seed Data (四極点)

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write seed SQL** `supabase/seed.sql`

```sql
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
```

- [ ] **Step 2: Run seed SQL in Supabase SQL Editor**

Paste and run `supabase/seed.sql` in Supabase Dashboard → SQL Editor.

Expected: 1 category, 4 locations, 1 title, 1 badge inserted.

- [ ] **Step 3: Verify data**

```sql
select count(*) from public.locations where category_id = '00000000-0000-0000-0000-000000000001';
```

Expected: `4`

---

## Task 6: TypeScript Database Types

**Files:**
- Create: `src/types/database.ts`

- [ ] **Step 1: Write database types** `src/types/database.ts`

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          name_en: string
          description: string | null
          color: string
          icon: string
          checkin_radius_meters: number
          xp_per_checkin: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      locations: {
        Row: {
          id: string
          category_id: string
          name: string
          name_en: string | null
          prefecture: string | null
          lat: number
          lng: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          total_xp: number
          level: number
          active_title_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          location_id: string
          photo_url: string
          checkin_lat: number
          checkin_lng: number
          distance_meters: number
          is_first: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>
      }
      titles: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['titles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['titles']['Insert']>
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          category_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      user_titles: {
        Row: {
          id: string
          user_id: string
          title_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_titles']['Row'], 'id' | 'earned_at'>
        Update: never
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'earned_at'>
        Update: never
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at'>
        Update: Pick<Database['public']['Tables']['friendships']['Row'], 'status'>
      }
    }
  }
}
```

---

## Task 7: Auth Pages

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/register/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`

- [ ] **Step 1: Create LoginForm component** `src/components/auth/LoginForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/map')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create RegisterForm component** `src/components/auth/RegisterForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/map')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">ユーザー名</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          placeholder="yamada_taro"
          minLength={3}
          maxLength={20}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          minLength={8}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '登録中...' : 'アカウント作成'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Create login page** `src/app/auth/login/page.tsx`

```tsx
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>sutamap へようこそ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-sm text-center text-gray-500">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/register" className="text-blue-600 underline">
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Create register page** `src/app/auth/register/page.tsx`

```tsx
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
          <CardDescription>アカウントを作成してスタンプラリーを始めよう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-sm text-center text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-blue-600 underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Create auth callback route** `src/app/auth/callback/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/map`)
}
```

---

## Task 8: Root Layout & Home Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update root layout** `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sutamap',
  description: '日本各地を巡るスタンプラリーゲーム',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a2e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update home page** `src/app/page.tsx`

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/map')
}
```

---

## Task 9: PWA Manifest

**Files:**
- Create: `public/manifest.json`

- [ ] **Step 1: Create PWA manifest** `public/manifest.json`

```json
{
  "name": "sutamap",
  "short_name": "sutamap",
  "description": "日本各地を巡るスタンプラリーゲーム",
  "start_url": "/map",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Note: Add actual icon files to `public/icons/` later (any 192×192 and 512×512 PNGs work for now).

---

## Task 10: Verify & Commit

- [ ] **Step 1: Run dev server and verify auth flow**

```bash
npm run dev
```

Open http://localhost:3000 → should redirect to /map (will 404 for now, that's OK).
Open http://localhost:3000/auth/register → register form should render.
Open http://localhost:3000/auth/login → login form should render.

- [ ] **Step 2: Test registration**

Fill in the register form with a test account. Check Supabase Dashboard → Authentication → Users to confirm the user was created. Check `user_profiles` table to confirm the trigger auto-created the profile.

- [ ] **Step 3: Test login**

Log in with the test account. Should redirect to /map.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: foundation — DB schema, auth, Supabase client setup"
```

---

## Self-Review Checklist

- [x] Project initialized with correct dependencies
- [x] Supabase browser + server clients set up
- [x] Session refresh middleware in place
- [x] DB schema covers all tables from the spec
- [x] RLS policies set (all data public read, write restricted)
- [x] Auto-profile creation trigger on signup
- [x] Seed data for 四極点 (4 locations, category, title, badge)
- [x] TypeScript types match DB schema
- [x] Auth pages (login, register) with error handling
- [x] PWA manifest
- [x] No .env.local in git
