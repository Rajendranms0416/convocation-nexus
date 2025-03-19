
import { User, DeviceLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Log device usage to Supabase
export const logDeviceUsage = async (user: User, deviceType: 'mobile' | 'desktop') => {
  try {
    // Create a new log entry
    const logEntry: DeviceLog = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      deviceType,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      ipAddress: '127.0.0.1' // In a real app, you'd get this from the server
    };
    
    console.log(`Logging device usage for ${user.name}, device type: ${deviceType}`);
    
    // Store in Supabase - Convert types to match what Supabase expects
    const { error } = await supabase
      .from('device_logs')
      .insert({
        id: logEntry.id,
        user_id: logEntry.userId,
        user_name: logEntry.userName,
        user_role: logEntry.userRole,
        device_type: logEntry.deviceType,
        user_agent: logEntry.userAgent,
        timestamp: logEntry.timestamp.toISOString(), // Convert Date to ISO string format
        ip_address: logEntry.ipAddress
      });
    
    if (error) {
      console.error('Error inserting device log:', error);
      
      // Fallback to localStorage if Supabase fails
      const storedLogs = localStorage.getItem('device_logs');
      const logs: DeviceLog[] = storedLogs ? JSON.parse(storedLogs) : [];
      logs.push(logEntry);
      localStorage.setItem('device_logs', JSON.stringify(logs));
    }
    
    // Log to console
    console.log(`Device usage logged: ${user.name} (${user.role}) using ${deviceType} device`);
    
    return logEntry;
  } catch (error) {
    console.error('Error logging device usage:', error);
    
    // Create a minimal log
    const logEntry: DeviceLog = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      deviceType,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      ipAddress: '127.0.0.1'
    };
    
    // Try to save to localStorage as fallback
    try {
      const storedLogs = localStorage.getItem('device_logs');
      const logs: DeviceLog[] = storedLogs ? JSON.parse(storedLogs) : [];
      logs.push(logEntry);
      localStorage.setItem('device_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    
    return logEntry;
  }
};

// Get all device logs from Supabase
export const getDeviceLogs = async (): Promise<DeviceLog[]> => {
  try {
    const { data, error } = await supabase
      .from('device_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Convert the data to match our DeviceLog type
    return data.map((log: any) => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      deviceType: log.device_type as 'mobile' | 'desktop',
      userAgent: log.user_agent,
      timestamp: new Date(log.timestamp),
      ipAddress: log.ip_address
    }));
  } catch (error) {
    console.error('Error getting device logs from Supabase:', error);
    
    // Fallback to localStorage
    try {
      const storedLogs = localStorage.getItem('device_logs');
      if (!storedLogs) return [];
      
      const logs = JSON.parse(storedLogs);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Error getting device logs from localStorage:', error);
      return [];
    }
  }
};

// Clear all device logs
export const clearDeviceLogs = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('device_logs')
      .delete()
      .neq('id', 'placeholder'); // Delete all records
    
    if (error) {
      throw error;
    }
    
    // Also clear localStorage backup
    localStorage.removeItem('device_logs');
    console.log('Device logs cleared');
  } catch (error) {
    console.error('Error clearing device logs:', error);
  }
};
