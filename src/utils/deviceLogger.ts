
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

/**
 * Logs device usage by teachers and admins
 * Stores information about when a user accessed the system and from what device
 */
export const logDeviceUsage = async (user: User, deviceType: 'mobile' | 'desktop') => {
  try {
    const userAgent = navigator.userAgent;
    
    // Get the IP address (using a service)
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch (error) {
      console.warn('Could not determine IP address:', error);
    }
    
    // Create the log entry
    const logEntry = {
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      device_type: deviceType,
      user_agent: userAgent,
      ip_address: ipAddress
    };
    
    // Insert into the device_logs table
    const { data, error } = await supabase
      .from('device_logs')
      .insert([logEntry]);
    
    if (error) {
      console.error('Error logging device usage:', error);
      return null;
    }
    
    return logEntry;
  } catch (error) {
    console.error('Error logging device usage:', error);
    return null;
  }
};

/**
 * Fetches device logs with filtering options
 */
export const fetchDeviceLogs = async ({
  userId,
  deviceType,
  fromDate,
  toDate,
  limit = 100,
  offset = 0
}: {
  userId?: string;
  deviceType?: 'mobile' | 'desktop';
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  try {
    // Start building the query
    let query = supabase
      .from('device_logs')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (deviceType) {
      query = query.eq('device_type', deviceType);
    }
    
    if (fromDate) {
      query = query.gte('timestamp', fromDate.toISOString());
    }
    
    if (toDate) {
      query = query.lte('timestamp', toDate.toISOString());
    }
    
    // Apply pagination
    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      logs: data,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching device logs:', error);
    throw error;
  }
};

/**
 * Gets statistics about device usage
 */
export const getDeviceUsageStats = async () => {
  try {
    // Get total counts
    const { data: totalData, error: totalError } = await supabase
      .from('device_logs')
      .select('id', { count: 'exact' });
    
    if (totalError) throw totalError;
    
    // Get counts by device type
    const { data: mobileData, error: mobileError } = await supabase
      .from('device_logs')
      .select('id', { count: 'exact' })
      .eq('device_type', 'mobile');
    
    if (mobileError) throw mobileError;
    
    const { data: desktopData, error: desktopError } = await supabase
      .from('device_logs')
      .select('id', { count: 'exact' })
      .eq('device_type', 'desktop');
    
    if (desktopError) throw desktopError;
    
    // Get unique user counts
    const { data: uniqueUserData, error: uniqueUserError } = await supabase
      .from('device_logs')
      .select('user_id')
      .limit(1000);  // Set a reasonable limit
    
    if (uniqueUserError) throw uniqueUserError;
    
    const uniqueUserCount = new Set(uniqueUserData?.map(log => log.user_id)).size;
    
    return {
      totalLogs: totalData?.length || 0,
      mobileLogs: mobileData?.length || 0,
      desktopLogs: desktopData?.length || 0,
      uniqueUsers: uniqueUserCount
    };
  } catch (error) {
    console.error('Error getting device usage stats:', error);
    throw error;
  }
};
