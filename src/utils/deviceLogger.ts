
import { User } from '@/types';

export interface DeviceLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  deviceType: 'mobile' | 'desktop';
  userAgent: string;
  timestamp: Date;
  ipAddress?: string;
}

// Use localStorage to store logs
const DEVICE_LOGS_KEY = 'convocation_device_logs';

export const logDeviceUsage = (user: User, deviceType: 'mobile' | 'desktop'): void => {
  try {
    // Get existing logs
    const existingLogsString = localStorage.getItem(DEVICE_LOGS_KEY);
    const existingLogs: DeviceLog[] = existingLogsString ? JSON.parse(existingLogsString) : [];
    
    // Create new log entry
    const newLog: DeviceLog = {
      id: crypto.randomUUID(), // Generate a unique ID
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      deviceType,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
    };
    
    console.log('Logging device usage:', newLog);
    
    // Add new log to existing logs (limit to last 100 entries to prevent storage issues)
    const updatedLogs = [newLog, ...existingLogs].slice(0, 100);
    
    // Save updated logs to localStorage
    localStorage.setItem(DEVICE_LOGS_KEY, JSON.stringify(updatedLogs));
    console.log('Device log saved, total logs:', updatedLogs.length);
  } catch (error) {
    console.error('Error logging device usage:', error);
  }
};

export const getDeviceLogs = (): DeviceLog[] => {
  try {
    const logsString = localStorage.getItem(DEVICE_LOGS_KEY);
    
    // Parse logs from localStorage
    if (!logsString) {
      console.log('No device logs found in localStorage');
      return [];
    }
    
    const logs = JSON.parse(logsString);
    console.log('Retrieved device logs:', logs.length);
    
    // Ensure timestamps are converted back from strings to Date objects
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  } catch (error) {
    console.error('Error retrieving device logs:', error);
    return [];
  }
};

export const clearDeviceLogs = (): void => {
  localStorage.removeItem(DEVICE_LOGS_KEY);
  console.log('Device logs cleared');
};
