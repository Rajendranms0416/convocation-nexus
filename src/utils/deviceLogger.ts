
import { User, DeviceLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Log device usage to localStorage only
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
    
    // Store in localStorage
    const storedLogs = localStorage.getItem('device_logs');
    const logs: DeviceLog[] = storedLogs ? JSON.parse(storedLogs) : [];
    logs.push(logEntry);
    localStorage.setItem('device_logs', JSON.stringify(logs));
    
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
    
    // Try to save to localStorage anyway
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

// Get all device logs from localStorage
export const getDeviceLogs = (): DeviceLog[] => {
  try {
    const storedLogs = localStorage.getItem('device_logs');
    if (!storedLogs) return [];
    
    const logs = JSON.parse(storedLogs);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Error getting device logs:', error);
    return [];
  }
};

// Clear all device logs from localStorage
export const clearDeviceLogs = (): void => {
  try {
    localStorage.removeItem('device_logs');
    console.log('Device logs cleared');
  } catch (error) {
    console.error('Error clearing device logs:', error);
  }
};
