
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const logDeviceUsage = async (user: User, deviceType: 'mobile' | 'desktop') => {
  try {
    // Log to console
    console.log(`Device usage logged: ${user.name} (${user.role}) using ${deviceType} device`);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('device_logs')
      .insert({
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        device_type: deviceType,
        user_agent: navigator.userAgent,
        ip_address: '127.0.0.1' // In a real app, you'd get this from the server
      });
      
    if (error) {
      console.error('Error logging device usage to database:', error);
    }
    
    // Also track in localStorage for local persistence
    const storedLogs = localStorage.getItem('device_logs');
    const logs = storedLogs ? JSON.parse(storedLogs) : [];
    
    logs.push({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      deviceType,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    });
    
    localStorage.setItem('device_logs', JSON.stringify(logs));
    
  } catch (error) {
    console.error('Error logging device usage:', error);
  }
};
