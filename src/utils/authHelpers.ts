import jwtDecode from 'jwt-decode';

/**
 * Get the user ID from the JWT token
 * @returns The user ID or null if not found
 */
export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('convocation_token');
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

/**
 * Get the user role from the JWT token
 * @returns The user role or null if not found
 */
export const getUserRoleFromToken = (): string | null => {
  const token = localStorage.getItem('convocation_token');
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

/**
 * Get all teachers from localStorage
 * @returns Array of teacher objects
 */
export const getAllTeachers = (): Record<string, string>[] => {
  const teachersJson = localStorage.getItem('convocation_teachers');
  
  if (!teachersJson) {
    return [];
  }
  
  try {
    return JSON.parse(teachersJson);
  } catch (e) {
    console.error('Error parsing teachers from localStorage:', e);
    return [];
  }
};

/**
 * Get teachers by session from localStorage
 * @param session The session to filter by
 * @returns Array of teacher objects for the session
 */
export const getTeachersBySession = (session: string): Record<string, string>[] => {
  const sessionsData = localStorage.getItem('convocation_sessions');
  
  if (!sessionsData) {
    return [];
  }
  
  try {
    const sessions = JSON.parse(sessionsData);
    
    if (!sessions[session]) {
      return [];
    }
    
    // Check if sessions[session] contains data or a reference to a table
    if (typeof sessions[session] === 'object' && sessions[session].tableName) {
      // It's a reference to a database table
      // This will be handled by the data loader to fetch from the database
      return [];
    }
    
    // Otherwise, it's the direct data array
    return sessions[session] || [];
  } catch (e) {
    console.error('Error parsing teachers by session from localStorage:', e);
    return [];
  }
};

/**
 * Get all available sessions from localStorage
 * @returns Array of session strings
 */
export const getAllSessions = (): string[] => {
  const sessionsData = localStorage.getItem('convocation_sessions');
  
  if (!sessionsData) {
    return [];
  }
  
  try {
    const sessions = JSON.parse(sessionsData);
    return Object.keys(sessions);
  } catch (e) {
    console.error('Error parsing sessions from localStorage:', e);
    return [];
  }
};

/**
 * Update the teachers list in localStorage
 * @param teachers Array of teacher objects
 * @param session Optional session to save for
 * @param tableName Optional table name for database reference
 */
export const updateTeachersList = (
  teachers: Record<string, string>[], 
  session: string = '', 
  tableName?: string
): Record<string, string>[] => {
  // Update the all teachers list
  localStorage.setItem('convocation_teachers', JSON.stringify(teachers));
  
  // If session is provided, update session-specific data
  if (session) {
    const sessionsData = localStorage.getItem('convocation_sessions') || '{}';
    try {
      const sessions = JSON.parse(sessionsData);
      
      if (tableName) {
        // Store a reference to the database table
        sessions[session] = { tableName, count: teachers.length };
      } else {
        // Store the actual data
        sessions[session] = teachers;
      }
      
      localStorage.setItem('convocation_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Error updating teachers by session in localStorage:', e);
    }
  }
  
  return teachers;
};

/**
 * Remove a session from localStorage
 * @param session The session to remove
 */
export const removeSession = (session: string): void => {
  const sessionsData = localStorage.getItem('convocation_sessions');
  
  if (!sessionsData) {
    return;
  }
  
  try {
    const sessions = JSON.parse(sessionsData);
    
    if (sessions[session]) {
      delete sessions[session];
      localStorage.setItem('convocation_sessions', JSON.stringify(sessions));
    }
  } catch (e) {
    console.error('Error removing session from localStorage:', e);
  }
};

/**
 * Check if a user is authenticated
 * @returns Boolean indicating if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('convocation_token');
  if (!token) return false;
  
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (e) {
    console.error('Error checking authentication:', e);
    return false;
  }
};
