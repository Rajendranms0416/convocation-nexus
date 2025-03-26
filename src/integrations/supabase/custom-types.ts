// Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      device_logs: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          teacher_id: string | null
        }
        Insert: {
          device_info?: Json | null
          id?: string
          teacher_id?: string | null
        }
        Update: {
          device_info?: Json | null
          id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          }
        ]
      }
      file_uploads: {
        Row: {
          created_at: string
          filename: string | null
          id: number
          record_count: number | null
          session_info: string | null
          table_name: string | null
          upload_date: string
        }
        Insert: {
          filename?: string | null
          id?: number
          record_count?: number | null
          session_info?: string | null
          table_name?: string | null
          upload_date?: string
        }
        Update: {
          filename?: string | null
          id?: number
          record_count?: number | null
          session_info?: string | null
          table_name?: string | null
          upload_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      teachers: {
        Row: {
          Class: string | null
          "Folder Email ID": string | null
          "Folder in Charge": string | null
          id: number
          "Programme Name": string | null
          "Robe Email ID": string | null
          "Robe in Charge": string | null
        }
        Insert: {
          Class?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          id?: number
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Robe in Charge"?: string | null
        }
        Update: {
          Class?: string | null
          "Folder Email ID"?: string | null
          "Folder in Charge"?: string | null
          id?: number
          "Programme Name"?: string | null
          "Robe Email ID"?: string | null
          "Robe in Charge"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_upload_table: {
        Args: {
          table_name: string
        }
        Returns: undefined
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & { row: any })
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Row"]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & { row: any })
    ? (Database["public"]["Tables"] & { row: any })[PublicTableNameOrOptions]["Row"]
    : never

export type TableInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Insert"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Insert"]
    : never

export type TableUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Update"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions]["Update"]
    : never

export type ExtendedDatabase = Database & {
  public: {
    Tables: {
      teachers: {
        Row: TeachersRow;
        Insert: TeachersInsert;
        Update: TeachersUpdate;
      };
    };
  };
};

// Function types
export interface CustomFunctions {
  create_upload_table: {
    Args: { table_name: string };
    Returns: any;
  };
}

// Teacher table types
export interface TeachersRow {
  id: number;
  "Programme Name"?: string;
  "Robe Email ID"?: string;
  "Folder Email ID"?: string;
  "Folder in Charge"?: string;
  "Robe in Charge"?: string;
}

// Insert type for Teachers
export interface TeachersInsert {
  "Programme Name"?: string;
  "Robe Email ID"?: string;
  "Folder Email ID"?: string;
  "Folder in Charge"?: string;
  "Robe in Charge"?: string;
}

// Update type for Teachers
export interface TeachersUpdate {
  "Programme Name"?: string;
  "Robe Email ID"?: string;
  "Folder Email ID"?: string;
  "Folder in Charge"?: string;
  "Robe in Charge"?: string;
}

// Dynamic table types for uploaded files
export interface DynamicTableRow {
  id: number;
  Programme_Name?: string;
  Robe_Email_ID?: string;
  Folder_Email_ID?: string;
  Accompanying_Teacher?: string;
  Folder_in_Charge?: string;
  Class_Section?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DynamicTableInsert {
  Programme_Name?: string;
  Robe_Email_ID?: string;
  Folder_Email_ID?: string;
  Accompanying_Teacher?: string;
  Folder_in_Charge?: string;
  Class_Section?: string;
}

export interface DynamicTableUpdate {
  Programme_Name?: string;
  Robe_Email_ID?: string;
  Folder_Email_ID?: string;
  Accompanying_Teacher?: string;
  Folder_in_Charge?: string;
  Class_Section?: string;
  updated_at?: string;
}
