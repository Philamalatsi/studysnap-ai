-- One summary output per material (prevents duplicates at DB level)
create unique index if not exists study_outputs_one_summary_per_material
  on public.study_outputs (material_id)
  where output_type = 'summary';
