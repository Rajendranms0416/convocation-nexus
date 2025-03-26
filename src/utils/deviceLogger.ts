import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export interface DeviceLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  deviceType: 'mobile' | 'desktop';
  userAgent: string;
  timestamp: string;
  ipAddress?: string;
}

export const logDeviceUsage = async (user: User, deviceType: 'mobile' | 'desktop') => {
  try {
    console.log('Logging device usage for user:', user.name, 'Device:', deviceType);
    
    // Get device information
    const userAgent = navigator.userAgent;
    
    // Try to insert into device_logs table
    try {
      const { data, error } = await supabase
        .from('device_logs')
        .insert({
          user_id: user.id,
          user_name: user.name,
          user_role: user.role,
          device_type: deviceType,
          user_agent: userAgent,
          ip_address: 'Client IP not available client-side'
        });
      
      if (error) {
        throw error;
      }
      
      console.log('Device usage logged successfully to database');
      return true;
    } catch (dbError) {
      console.warn('Error logging to database, falling back to localStorage:', dbError);
      
      // Fallback to localStorage
      const logs = JSON.parse(localStorage.getItem('device_logs') || '[]');
      logs.push({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        deviceType,
        userAgent,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('device_logs', JSON.stringify(logs));
      console.log('Device usage logged successfully to localStorage');
      return true;
    }
  } catch (error) {
    console.error('Error in logDeviceUsage:', error);
    return false;
  }
};

export const fetchDeviceLogs = async ({ limit = 100, offset = 0, filterBy = null, sortBy = 'timestamp', sortOrder = 'desc' }) => {
  try {
    console.log('Fetching device logs with params:', { limit, offset, filterBy, sortBy, sortOrder });
    
    // Start building the query
    let query = supabase
      .from('device_logs')
      .select('*');
    
    // Apply filters if provided
    if (filterBy) {
      if (filterBy.deviceType) {
        query = query.eq('device_type', filterBy.deviceType);
      }
      
      if (filterBy.userRole) {
        query = query.eq('user_role', filterBy.userRole);
      }
      
      if (filterBy.userId) {
        query = query.eq('user_id', filterBy.userId);
      }
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.warn('Error fetching device logs from Supabase, falling back to localStorage:', error);
      
      // Fallback to localStorage if database error
      const localLogs = JSON.parse(localStorage.getItem('device_logs') || '[]');
      console.log('Fallback to localStorage, found logs:', localLogs.length);
      
      return {
        logs: localLogs.map((log: any, index: number) => ({
          id: `local-${index}`,
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          deviceType: log.deviceType,
          userAgent: log.userAgent,
          timestamp: log.timestamp,
          ipAddress: 'local'
        })),
        total: localLogs.length
      };
    }
    
    console.log('Successfully fetched device logs:', data?.length);
    
    // Transform the data to match the DeviceLog interface
    const transformedLogs: DeviceLog[] = data.map(log => ({
      id: String(log.id),
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      deviceType: log.device_type,
      userAgent: log.user_agent,
      timestamp: log.created_at,
      ipAddress: log.ip_address
    }));
    
    return {
      logs: transformedLogs,
      total: count || transformedLogs.length
    };
  } catch (error) {
    console.error('Error in fetchDeviceLogs:', error);
    return { logs: [], total: 0 };
  }
};

// This function is no longer needed since we'll create the table via SQL migrations
// But we'll keep it for backward compatibility, it will just return true without doing anything
export const createDeviceLogsTable = async () => {
  console.log('Device logs table is expected to be created via migrations');
  return true;
};
