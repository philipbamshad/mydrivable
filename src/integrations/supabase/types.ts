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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_coach_usage: {
        Row: {
          used: number
          user_id: string
        }
        Insert: {
          used?: number
          user_id: string
        }
        Update: {
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_daily_usage: {
        Row: {
          local_day: string
          used: number
          user_id: string
        }
        Insert: {
          local_day: string
          used?: number
          user_id: string
        }
        Update: {
          local_day?: string
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      app_admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      app_allowlist: {
        Row: {
          created_at: string
          email: string
          note: string
        }
        Insert: {
          created_at?: string
          email: string
          note?: string
        }
        Update: {
          created_at?: string
          email?: string
          note?: string
        }
        Relationships: []
      }
      cron_tokens: {
        Row: {
          name: string
          token: string
        }
        Insert: {
          name: string
          token?: string
        }
        Update: {
          name?: string
          token?: string
        }
        Relationships: []
      }
      driving_logs: {
        Row: {
          conditions: string | null
          created_at: string
          environment: string | null
          hours: number
          id: string
          logged_at: string
          maneuver: string
          maneuvers: string[]
          minutes: number | null
          note: string
          supervisor_approved: boolean
          user_id: string
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          environment?: string | null
          hours: number
          id?: string
          logged_at?: string
          maneuver?: string
          maneuvers?: string[]
          minutes?: number | null
          note?: string
          supervisor_approved?: boolean
          user_id: string
        }
        Update: {
          conditions?: string | null
          created_at?: string
          environment?: string | null
          hours?: number
          id?: string
          logged_at?: string
          maneuver?: string
          maneuvers?: string[]
          minutes?: number | null
          note?: string
          supervisor_approved?: boolean
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts: Json
          role: string
          thread_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_history: {
        Row: {
          created_at: string
          id: string
          score_pct: number
          state: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score_pct: number
          state?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score_pct?: number
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_attempts: {
        Row: {
          answers: Json
          average_reaction: number | null
          completed: boolean
          created_at: string
          feature: string
          free_slot: boolean
          id: string
          payload: Json
          score: number | null
          state: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          answers?: Json
          average_reaction?: number | null
          completed?: boolean
          created_at?: string
          feature: string
          free_slot: boolean
          id?: string
          payload: Json
          score?: number | null
          state: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          answers?: Json
          average_reaction?: number | null
          completed?: boolean
          created_at?: string
          feature?: string
          free_slot?: boolean
          id?: string
          payload?: Json
          score?: number | null
          state?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      test_hub_progress: {
        Row: {
          best_score: number | null
          last_score: number | null
          questions: Json
          state: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number | null
          last_score?: number | null
          questions?: Json
          state: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number | null
          last_score?: number | null
          questions?: Json
          state?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          created_at: string
          id: string
          phase: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phase?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phase?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          active_state: string
          created_at: string
          daily_done: Json
          daily_done_date: string | null
          email_reminders: boolean
          free_usage: Json
          reminder_1d_sent_for_date: string | null
          reminder_7d_sent_for_date: string | null
          skill_mastery: Json
          target_date: string | null
          theme: string
          timezone: string
          updated_at: string
          user_id: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          active_state?: string
          created_at?: string
          daily_done?: Json
          daily_done_date?: string | null
          email_reminders?: boolean
          free_usage?: Json
          reminder_1d_sent_for_date?: string | null
          reminder_7d_sent_for_date?: string | null
          skill_mastery?: Json
          target_date?: string | null
          theme?: string
          timezone?: string
          updated_at?: string
          user_id: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          active_state?: string
          created_at?: string
          daily_done?: Json
          daily_done_date?: string | null
          email_reminders?: boolean
          free_usage?: Json
          reminder_1d_sent_for_date?: string | null
          reminder_7d_sent_for_date?: string | null
          skill_mastery?: Json
          target_date?: string | null
          theme?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      waitlist_submission_windows: {
        Row: {
          started_at: string
          submissions: number
          visitor_hash: string
        }
        Insert: {
          started_at?: string
          submissions?: number
          visitor_hash: string
        }
        Update: {
          started_at?: string
          submissions?: number
          visitor_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      coach_local_day: { Args: { p_user: string }; Returns: string }
      commit_study_answer: {
        Args: {
          p_answer: Json
          p_hub?: Json
          p_id: string
          p_reaction: number
          p_score: number
          p_user: string
          p_version: number
        }
        Returns: {
          answers: Json
          average_reaction: number | null
          completed: boolean
          created_at: string
          feature: string
          free_slot: boolean
          id: string
          payload: Json
          score: number | null
          state: string
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "study_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      consume_ai_coach_credit: { Args: never; Returns: number }
      consume_daily_coach_credit: { Args: never; Returns: number }
      delete_own_app_data: { Args: never; Returns: undefined }
      get_daily_coach_used: { Args: never; Returns: number }
      has_pro_access: { Args: { p_user: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_allowlisted: { Args: never; Returns: boolean }
      join_waitlist_checked: {
        Args: { p_email: string; p_visitor_hash: string }
        Returns: {
          result: string
          signup_id: string
          signup_time: string
        }[]
      }
      reserve_study_attempt: {
        Args: {
          p_feature: string
          p_payload: Json
          p_state: string
          p_user: string
        }
        Returns: {
          answers: Json
          average_reaction: number | null
          completed: boolean
          created_at: string
          feature: string
          free_slot: boolean
          id: string
          payload: Json
          score: number | null
          state: string
          updated_at: string
          user_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "study_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
