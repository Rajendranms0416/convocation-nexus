
import { User, DeviceLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Log device usage to Supabase and localStorage
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
    
    // Insert into Supabase table
    const { error } = await supabase
      .from('device_logs')
      .insert({
        user_id: logEntry.userId,
        user_name: logEntry.userName,
        user_role: logEntry.userRole,
        device_type: logEntry.deviceType,
        user_agent: logEntry.userAgent,
        ip_address: logEntry.ipAddress,
      });
      
    if (error) {
      console.error('Error inserting to Supabase:', error);
      
      // Fallback to localStorage if Supabase insert fails
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
    
    // Fallback to localStorage
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
    
    const storedLogs = localStorage.getItem('device_logs');
    const logs: DeviceLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    logs.push(logEntry);
    localStorage.setItem('device_logs', JSON.stringify(logs));
    
    return logEntry;
  }
};

// Get all device logs from Supabase with fallback to localStorage
export const getDeviceLogs = async (): Promise<DeviceLog[]> => {
  try {
    // Try to get logs from Supabase first
    const { data, error } = await supabase
      .from('device_logs')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (data) {
      return data.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        userName: log.user_name,
        userRole: log.user_role,
        deviceType: log.device_type,
        userAgent: log.user_agent,
        timestamp: new Date(log.timestamp),
        ipAddress: log.ip_address
      }));
    }
    
    // Fallback to localStorage
    const storedLogs = localStorage.getItem('device_logs');
    if (!storedLogs) return [];
    
    const logs = JSON.parse(storedLogs);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Error getting device logs:', error);
    
    // Fallback to localStorage
    const storedLogs = localStorage.getItem('device_logs');
    if (!storedLogs) return [];
    
    const logs = JSON.parse(storedLogs);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  }
};

// Clear all device logs (Supabase and localStorage)
export const clearDeviceLogs = async (): Promise<void> => {
  try {
    // Clear from Supabase
    const { error } = await supabase
      .from('device_logs')
      .delete()
      .eq('user_id', supabase.auth.getUser().then(({ data }) => data.user?.id));
      
    if (error) {
      console.error('Error clearing Supabase logs:', error);
    }
    
    // Also clear from localStorage
    localStorage.removeItem('device_logs');
    console.log('Device logs cleared');
  } catch (error) {
    console.error('Error clearing device logs:', error);
    
    // Clear from localStorage as fallback
    localStorage.removeItem('device_logs');
  }
};
