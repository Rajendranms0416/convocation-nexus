
import { Database } from './types';

// Extend the existing Database type to add our custom tables
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
        Relationships: [];
      };
    } & Database['public']['Tables'];
  };
};

// Define the structure for the dynamic tables created for each upload
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

// Type for dynamic table insert/update operations
export interface DynamicTableInsert {
  Programme_Name?: string | null;
  Robe_Email_ID?: string | null;
  Folder_Email_ID?: string | null;
  Accompanying_Teacher?: string | null;
  Folder_in_Charge?: string | null;
  Class_Section?: string | null;
}

// Interface for teachers table operations to match column names
export interface TeachersInsert {
  "Programme Name"?: string | null;
  "Robe Email ID"?: string | null;
  "Folder Email ID"?: string | null;
  "Robe in Charge"?: string | null;
  "Folder in Charge"?: string | null;
  id?: number;
}

export interface TeachersUpdate {
  "Programme Name"?: string | null;
  "Robe Email ID"?: string | null;
  "Folder Email ID"?: string | null;
  "Robe in Charge"?: string | null;
  "Folder in Charge"?: string | null;
  id?: number;
}

// Add a type for our RLS function
export interface CustomFunctions {
  create_upload_table: (table_name: string) => void;
}
