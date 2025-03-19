
/**
 * Excel Service - Utility functions
 */

/**
 * Normalize header names to standard format
 * @param headerName The original header name
 * @returns Normalized header name
 */
export const normalizeHeaderName = (headerName: string): string => {
  const header = headerName.trim();
  const lowerHeader = header.toLowerCase();
  
  // Define mappings for common variations
  if (lowerHeader.includes('program') || 
      lowerHeader.includes('course') || 
      lowerHeader.includes('class')) {
    return 'Programme Name';
  } else if (lowerHeader.includes('robe') && lowerHeader.includes('email') || 
             lowerHeader.includes('teacher') && lowerHeader.includes('email') ||
             lowerHeader.includes('accompanying')) {
    return 'Robe Email ID';
  } else if (lowerHeader.includes('folder') && lowerHeader.includes('email') ||
             lowerHeader.includes('charge') && lowerHeader.includes('email')) {
    return 'Folder Email ID';
  } else if (lowerHeader.includes('name') && 
            (lowerHeader.includes('teacher') || 
             lowerHeader.includes('robe') || 
             lowerHeader.includes('accompanying'))) {
    return 'Accompanying Teacher';
  } else if (lowerHeader.includes('name') && 
            (lowerHeader.includes('folder') || 
             lowerHeader.includes('charge'))) {
    return 'Folder in Charge';
  } else if (lowerHeader.includes('teacher') && !lowerHeader.includes('email')) {
    return 'Accompanying Teacher';
  } else if (lowerHeader.includes('name') && !lowerHeader.includes('program')) {
    // If it's just a generic "name" column, assume it's a teacher name
    return 'Accompanying Teacher';
  }
  
  // Return original if no mapping found
  return header;
};
