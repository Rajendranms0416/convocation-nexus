// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://girudyhgdhyedabjkhcj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnVkeWhnZGh5ZWRhYmpraGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODg1OTYsImV4cCI6MjA1Nzg2NDU5Nn0.C334kvbE6rW7KB1bsy5KOCp-26aS3pEYW1r6YGnhkU0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);