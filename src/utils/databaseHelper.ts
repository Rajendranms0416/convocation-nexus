
import { supabase } from '@/integrations/supabase/client';
import { createDeviceLogsTable } from './deviceLogger';

export const initializeTables = async () => {
  try {
    // Check if the device_logs table exists, if not create it
    const isDeviceLogsCreated = await createDeviceLogsTable();
    
    if (!isDeviceLogsCreated) {
      console.error('Failed to create device_logs table');
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
