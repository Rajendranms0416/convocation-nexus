
import { supabase } from '@/integrations/supabase/client';

export const initializeTables = async () => {
  try {
    // Check if we can connect to the database
    const { error } = await supabase
      .from('teachers')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to database:', error);
      return false;
    }
    
    console.log('Successfully connected to database');
    return true;
  } catch (error) {
    console.error('Error initializing database connection:', error);
    return false;
  }
};

// Call this function when the app starts
export const setupDatabase = async () => {
  await initializeTables();
};
