
import { Database } from './types';

// Extend the custom types to include more precise definitions
export type ExtendedDatabase = Database & {
  public: {
    Tables: {
      file_uploads: {
        Row: {
          id: number;
          filename: string;
          table_name: string;
          upload_date: string;
          session_info: string | null;
          record_count: number | null;
        };
        Insert: {
          id?: number;
          filename: string;
          table_name: string;
          upload_date?: string;
          session_info?: string | null;
          record_count?: number | null;
        };
        Update: {
          id?: number;
          filename?: string;
          table_name?: string;
          upload_date?: string;
          session_info?: string | null;
          record_count?: number | null;
        };
      };
    } & Database['public']['Tables'];
  };
};

// Teachers table insert and update types
export interface TeachersInsert {
  "Programme Name"?: string | null;
  "Robe Email ID"?: string | null;
  "Folder Email ID"?: string | null;
  "Folder in Charge"?: string | null;
  "Robe in Charge"?: string | null;
}

export interface TeachersUpdate {
  "Programme Name"?: string | null;
  "Robe Email ID"?: string | null;
  "Folder Email ID"?: string | null;
  "Folder in Charge"?: string | null;
  "Robe in Charge"?: string | null;
}

// Precise definition for dynamic table row
export interface DynamicTableRow {
  id: number;
  Programme_Name: string | null;
  Robe_Email_ID: string | null;
  Folder_Email_ID: string | null;
  Accompanying_Teacher: string | null;
  Folder_in_Charge: string | null;
  Class_Section: string | null;
  created_at?: string;
  updated_at?: string;
}

// Type for dynamic table insert operations
export interface DynamicTableInsert {
  Programme_Name?: string | null;
  Robe_Email_ID?: string | null;
  Folder_Email_ID?: string | null;
  Accompanying_Teacher?: string | null;
  Folder_in_Charge?: string | null;
  Class_Section?: string | null;
}

// Custom functions interface
export interface CustomFunctions {
  create_upload_table: (table_name: string) => void;
  is_super_admin: () => boolean;
}
