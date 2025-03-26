
import { supabase } from '@/integrations/supabase/client';

export const initializeTables = async () => {
  try {
    // Check if the device_logs table exists, if not create it
    const { error: deviceLogsError } = await supabase.rpc('create_device_logs_table');
    
    if (deviceLogsError) {
      console.error('Error creating device_logs table:', deviceLogsError);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    return false;
  }
};

// Call this function when the app starts
export const setupDatabase = async () => {
  await initializeTables();
};
