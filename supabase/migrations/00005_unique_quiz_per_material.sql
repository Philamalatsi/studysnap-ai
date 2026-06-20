-- One quiz per material
create unique index if not exists study_outputs_one_quiz_per_material
  on public.study_outputs (material_id)
  where output_type = 'quiz';
