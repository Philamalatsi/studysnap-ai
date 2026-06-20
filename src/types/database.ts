export type PlanTier = "free" | "premium";
export type MaterialType = "image" | "pdf" | "screenshot" | "handwritten";
export type ProcessingStatus =
  | "uploaded"
  | "extracting"
  | "extracted"
  | "failed";
export type OutputType = "summary" | "flashcards" | "quiz";
export type OutputStatus = "pending" | "generating" | "ready" | "failed";
export type StudyMode = "summary" | "flashcards" | "quiz";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_tier: PlanTier;
  uploads_this_month: number;
  uploads_month_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  material_type: MaterialType;
  mime_type: string;
  file_size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  processing_status: ProcessingStatus;
  page_count: number | null;
  extracted_text: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyOutput {
  id: string;
  user_id: string;
  material_id: string;
  output_type: OutputType;
  status: OutputStatus;
  title: string | null;
  content: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialFolder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  material_id: string;
  study_mode: StudyMode;
  progress: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Profile, "id">>
      >;
      materials: TableDef<
        Material,
        Omit<Material, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<Material, "id" | "user_id">>
      >;
      material_folders: TableDef<
        MaterialFolder,
        Omit<MaterialFolder, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<MaterialFolder, "id" | "user_id">>
      >;
      study_outputs: TableDef<
        StudyOutput,
        Omit<StudyOutput, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<StudyOutput, "id" | "user_id">>
      >;
      study_progress: TableDef<
        StudyProgress,
        Omit<StudyProgress, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<StudyProgress, "id" | "user_id">>
      >;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_tier: PlanTier;
      material_type: MaterialType;
      processing_status: ProcessingStatus;
      output_type: OutputType;
      output_status: OutputStatus;
      study_mode: StudyMode;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
