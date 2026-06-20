-- StudySnap AI — Initial schema (Week 1)
-- Run via Supabase CLI: supabase db push
-- Or paste into Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type public.plan_tier as enum ('free', 'premium');
create type public.material_type as enum (
  'image',
  'pdf',
  'screenshot',
  'handwritten'
);
create type public.processing_status as enum (
  'uploaded',
  'extracting',
  'extracted',
  'failed'
);
create type public.output_type as enum (
  'summary',
  'flashcards',
  'quiz'
);
create type public.output_status as enum (
  'pending',
  'generating',
  'ready',
  'failed'
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan_tier public.plan_tier not null default 'free',
  uploads_this_month integer not null default 0,
  uploads_month_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile and subscription metadata';

-- Study materials (uploaded files)
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  material_type public.material_type not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  storage_bucket text not null default 'uploads',
  storage_path text not null,
  processing_status public.processing_status not null default 'uploaded',
  page_count integer,
  extracted_text text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint materials_storage_path_unique unique (storage_path)
);

create index materials_user_id_idx on public.materials (user_id);
create index materials_user_created_idx on public.materials (user_id, created_at desc);
create index materials_processing_status_idx on public.materials (processing_status)
  where processing_status in ('uploaded', 'extracting');

comment on table public.materials is 'Uploaded textbook photos, notes, screenshots, PDFs';

-- AI-generated outputs (placeholders for Week 2+)
create table public.study_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  output_type public.output_type not null,
  status public.output_status not null default 'pending',
  title text,
  content jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index study_outputs_material_id_idx on public.study_outputs (material_id);
create index study_outputs_user_id_idx on public.study_outputs (user_id);

comment on table public.study_outputs is 'Summaries, flashcards, quizzes linked to materials';

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger materials_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();

create trigger study_outputs_updated_at
  before update on public.study_outputs
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.study_outputs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Materials policies
create policy "Users can view own materials"
  on public.materials for select
  using (auth.uid() = user_id);

create policy "Users can insert own materials"
  on public.materials for insert
  with check (auth.uid() = user_id);

create policy "Users can update own materials"
  on public.materials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own materials"
  on public.materials for delete
  using (auth.uid() = user_id);

-- Study outputs policies
create policy "Users can view own study outputs"
  on public.study_outputs for select
  using (auth.uid() = user_id);

create policy "Users can insert own study outputs"
  on public.study_outputs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study outputs"
  on public.study_outputs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own study outputs"
  on public.study_outputs for delete
  using (auth.uid() = user_id);

-- Storage bucket (run in Supabase Dashboard or via CLI)
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'uploads',
--   'uploads',
--   false,
--   52428800,
--   array['image/jpeg','image/png','image/webp','image/heic','application/pdf']
-- );

-- Storage policies (uncomment after bucket exists)
-- create policy "Users can upload to own folder"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'uploads'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- create policy "Users can read own uploads"
--   on storage.objects for select
--   using (
--     bucket_id = 'uploads'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- create policy "Users can delete own uploads"
--   on storage.objects for delete
--   using (
--     bucket_id = 'uploads'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );
