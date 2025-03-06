
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

// Use localStorage to store logs temporarily
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
      // Note: IP address can't be reliably obtained on client-side
    };
    
    // Add new log to existing logs (limit to last 100 entries to prevent storage issues)
    const updatedLogs = [newLog, ...existingLogs].slice(0, 100);
    
    // Save updated logs
    localStorage.setItem(DEVICE_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error logging device usage:', error);
  }
};

export const getDeviceLogs = (): DeviceLog[] => {
  try {
    const logsString = localStorage.getItem(DEVICE_LOGS_KEY);
    return logsString ? JSON.parse(logsString) : [];
  } catch (error) {
    console.error('Error retrieving device logs:', error);
    return [];
  }
};

export const clearDeviceLogs = (): void => {
  localStorage.removeItem(DEVICE_LOGS_KEY);
};
