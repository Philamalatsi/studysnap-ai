-- One flashcard deck per material
create unique index if not exists study_outputs_one_flashcards_per_material
  on public.study_outputs (material_id)
  where output_type = 'flashcards';
