
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const logDeviceUsage = async (user: User, deviceType: 'mobile' | 'desktop') => {
  try {
    console.log('Logging device usage for user:', user.name, 'Device:', deviceType);
    
    // Get device information
    const userAgent = navigator.userAgent;
    
    // Insert into device_logs table
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
      console.error('Error logging device usage:', error);
      
      // Fallback to localStorage if database error
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
    } else {
      console.log('Device usage logged successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error in logDeviceUsage:', error);
    return false;
  }
};
