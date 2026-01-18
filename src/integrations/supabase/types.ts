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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      churches: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          pastor_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          pastor_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          pastor_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          church_id: string
          content: string
          created_at: string
          id: string
          is_broadcast: boolean
          read_at: string | null
          recipient_id: string | null
          recipient_team_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          church_id: string
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          read_at?: string | null
          recipient_id?: string | null
          recipient_team_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          church_id?: string
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          read_at?: string | null
          recipient_id?: string | null
          recipient_team_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_team_id_fkey"
            columns: ["recipient_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          id: string
          leader_id: string | null
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          musical_skills: string[] | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          musical_skills?: string[] | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          musical_skills?: string[] | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          role_assigned: string | null
          schedule_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          role_assigned?: string | null
          schedule_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          role_assigned?: string | null
          schedule_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          church_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          location: string | null
          ministry_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          location?: string | null
          ministry_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          location?: string | null
          ministry_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      substitution_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          requester_id: string
          response_message: string | null
          schedule_assignment_id: string
          status: Database["public"]["Enums"]["substitution_status"]
          substitute_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          requester_id: string
          response_message?: string | null
          schedule_assignment_id: string
          status?: Database["public"]["Enums"]["substitution_status"]
          substitute_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          requester_id?: string
          response_message?: string | null
          schedule_assignment_id?: string
          status?: Database["public"]["Enums"]["substitution_status"]
          substitute_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "substitution_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitution_requests_schedule_assignment_id_fkey"
            columns: ["schedule_assignment_id"]
            isOneToOne: false
            referencedRelation: "schedule_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitution_requests_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          role_in_team: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          role_in_team?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          role_in_team?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_id: string | null
          ministry_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          ministry_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string | null
          ministry_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          church_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_church_id_for_assignment: {
        Args: { p_assignment_id: string }
        Returns: string
      }
      get_church_id_for_ministry: {
        Args: { p_ministry_id: string }
        Returns: string
      }
      get_church_id_for_schedule: {
        Args: { p_schedule_id: string }
        Returns: string
      }
      get_church_id_for_team: { Args: { p_team_id: string }; Returns: string }
      get_current_profile_id: { Args: never; Returns: string }
      has_role_in_church: {
        Args: {
          p_church_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_church_admin: { Args: { p_church_id: string }; Returns: boolean }
      is_church_member: { Args: { p_church_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "member"
      member_status: "active" | "inactive"
      substitution_status: "pending" | "accepted" | "rejected"
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
    Enums: {
      app_role: ["admin", "member"],
      member_status: ["active", "inactive"],
      substitution_status: ["pending", "accepted", "rejected"],
    },
  },
} as const
