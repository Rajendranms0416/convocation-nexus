
import { useState } from 'react';

/**
 * Hook to manage teacher class state
 */
export const useTeacherClassState = () => {
  const [availableClasses, setAvailableClasses] = useState([
    'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
    'MCA 1st Year', 'MCA 2nd Year', 
    'BCom 1st Year', 'BCom 2nd Year', 'BCom 3rd Year',
    'MBA 1st Year', 'MBA 2nd Year'
  ]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  return {
    availableClasses,
    setAvailableClasses,
    selectedClasses,
    setSelectedClasses,
  };
};
