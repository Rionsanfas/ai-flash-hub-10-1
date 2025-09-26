export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_sets: {
        Row: {
          card_count: number | null
          created_at: string
          difficulty_level: string | null
          exam_date: string | null
          id: string
          learning_mode: string | null
          subject: string
          subject_focus: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          difficulty_level?: string | null
          exam_date?: string | null
          id?: string
          learning_mode?: string | null
          subject: string
          subject_focus?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          difficulty_level?: string | null
          exam_date?: string | null
          id?: string
          learning_mode?: string | null
          subject?: string
          subject_focus?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          difficulty: number | null
          id: string
          last_rating: string | null
          last_studied_at: string | null
          next_review_date: string | null
          question: string
          review_count: number | null
          set_id: string
          times_rated_hard: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty?: number | null
          id?: string
          last_rating?: string | null
          last_studied_at?: string | null
          next_review_date?: string | null
          question: string
          review_count?: number | null
          set_id: string
          times_rated_hard?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          difficulty?: number | null
          id?: string
          last_rating?: string | null
          last_studied_at?: string | null
          next_review_date?: string | null
          question?: string
          review_count?: number | null
          set_id?: string
          times_rated_hard?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          cards_correct: number | null
          cards_studied: number | null
          completed_at: string | null
          created_at: string
          flashcard_set_id: string
          id: string
          session_duration: number | null
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cards_correct?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          created_at?: string
          flashcard_set_id: string
          id?: string
          session_duration?: number | null
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cards_correct?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          created_at?: string
          flashcard_set_id?: string
          id?: string
          session_duration?: number | null
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_flashcard_set_id_fkey"
            columns: ["flashcard_set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      timer_sessions: {
        Row: {
          created_at: string
          duration: number
          id: string
          is_running: boolean | null
          paused_at: string | null
          remaining_time: number
          started_at: string | null
          timer_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          is_running?: boolean | null
          paused_at?: string | null
          remaining_time: number
          started_at?: string | null
          timer_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          is_running?: boolean | null
          paused_at?: string | null
          remaining_time?: number
          started_at?: string | null
          timer_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          created_at: string
          extraction_text: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          processed: boolean | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extraction_text?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          processed?: boolean | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          extraction_text?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          processed?: boolean | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
