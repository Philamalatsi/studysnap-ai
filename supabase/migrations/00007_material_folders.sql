-- Folders/sections to group study materials

create table public.material_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint material_folders_user_name_unique unique (user_id, name)
);

create index material_folders_user_id_idx on public.material_folders (user_id);

create trigger material_folders_updated_at
  before update on public.material_folders
  for each row execute function public.set_updated_at();

alter table public.materials
  add column folder_id uuid references public.material_folders (id) on delete set null;

create index materials_folder_id_idx on public.materials (folder_id);

comment on table public.material_folders is 'User-defined folders to group uploaded materials';

alter table public.material_folders enable row level security;

create policy "Users can view own folders"
  on public.material_folders for select
  using (auth.uid() = user_id);

create policy "Users can insert own folders"
  on public.material_folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own folders"
  on public.material_folders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own folders"
  on public.material_folders for delete
  using (auth.uid() = user_id);
