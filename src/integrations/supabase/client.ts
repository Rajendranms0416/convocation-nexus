
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { ExtendedDatabase, CustomFunctions, DynamicTableRow, DynamicTableInsert } from './custom-types';

const SUPABASE_URL = "https://girudyhgdhyedabjkhcj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnVkeWhnZGh5ZWRhYmpraGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODg1OTYsImV4cCI6MjA1Nzg2NDU5Nn0.C334kvbE6rW7KB1bsy5KOCp-26aS3pEYW1r6YGnhkU0";

export const supabase = createClient<ExtendedDatabase>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);

// Helper function to safely query dynamic tables with proper type handling
export const queryDynamicTable = (tableName: string) => {
  return supabase.from(tableName);
};

// Helper for handling RPC functions
export const callFunction = (
  functionName: string,
  ...args: any[]
) => {
  return supabase.rpc(functionName, ...args);
};
