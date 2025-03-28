export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      device_logs: {
        Row: {
          device_type: string
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          device_type: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent: string
          user_id: string
          user_name: string
          user_role: string
        }
        Update: {
          device_type?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          filename: string
          id: number
          record_count: number | null
          session_info: string | null
          table_name: string
          upload_date: string | null
        }
        Insert: {
          filename: string
          id?: number
          record_count?: number | null
          session_info?: string | null
          table_name: string
          upload_date?: string | null
        }
        Update: {
          filename?: string
          id?: number
          record_count?: number | null
          session_info?: string | null
          table_name?: string
          upload_date?: string | null
        }
        Relationships: []
      }
      "Teacher's List": {
        Row: {
          "Accompanying Teacher": string | null
          "Class Wise/\nSection Wise": string | null
          "Folder Email ID": string | null
          "Folder in Charge": string | null
          "HOD/Coordinator": string | null
          "Programme Name": string | null
          "Robe Email ID": string | null
          "Room Nos. Distribution of Robes": number | null
          "Room Nos. Return of Robes": number | null
          "Sl. No": number
          "Total Count\n(Reg & Supp)": number | null
        }
        Insert: {
          "Accompanying Teacher"?: string | null
          "Class Wise/\nSection Wise"?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          "HOD/Coordinator"?: string | null
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Room Nos. Distribution of Robes"?: number | null
          "Room Nos. Return of Robes"?: number | null
          "Sl. No": number
          "Total Count\n(Reg & Supp)"?: number | null
        }
        Update: {
          "Accompanying Teacher"?: string | null
          "Class Wise/\nSection Wise"?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          "HOD/Coordinator"?: string | null
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Room Nos. Distribution of Robes"?: number | null
          "Room Nos. Return of Robes"?: number | null
          "Sl. No"?: number
          "Total Count\n(Reg & Supp)"?: number | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          "Accompanying Teacher": string | null
          "Class Wise/Section Wise": string | null
          created_at: string | null
          "Folder Email ID": string | null
          "Folder in Charge": string | null
          id: number
          "Programme Name": string | null
          "Robe Email ID": string | null
          "Robe in Charge": string | null
          updated_at: string | null
        }
        Insert: {
          "Accompanying Teacher"?: string | null
          "Class Wise/Section Wise"?: string | null
          created_at?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          id?: number
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Robe in Charge"?: string | null
          updated_at?: string | null
        }
        Update: {
          "Accompanying Teacher"?: string | null
          "Class Wise/Section Wise"?: string | null
          created_at?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          id?: number
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Robe in Charge"?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_device_logs_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_upload_table: {
        Args: {
          table_name: string
        }
        Returns: undefined
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
