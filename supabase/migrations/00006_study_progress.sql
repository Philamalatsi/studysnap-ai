-- Persist in-app study position (quiz, flashcards, summary scroll)

create type public.study_mode as enum ('summary', 'flashcards', 'quiz');

create table public.study_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  study_mode public.study_mode not null,
  progress jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_progress_user_material_mode_unique
    unique (user_id, material_id, study_mode)
);

create index study_progress_user_material_idx
  on public.study_progress (user_id, material_id);

create trigger study_progress_updated_at
  before update on public.study_progress
  for each row execute function public.set_updated_at();

comment on table public.study_progress is 'Saved scroll/card/quiz position per user and material';

alter table public.study_progress enable row level security;

create policy "Users can view own study progress"
  on public.study_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own study progress"
  on public.study_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study progress"
  on public.study_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own study progress"
  on public.study_progress for delete
  using (auth.uid() = user_id);
