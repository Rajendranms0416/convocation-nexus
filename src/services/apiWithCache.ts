
import { studentApi } from './api';
import { Student, FilterOption } from '@/types';

const CACHE_DURATION = {
  STUDENTS: 2 * 60 * 1000, // 2 minutes
  OPTIONS: 10 * 60 * 1000, // 10 minutes
};

// Simple in-memory cache implementation
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if cache is expired
    if (Date.now() - item.timestamp > CACHE_DURATION.STUDENTS) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePatternMatch(pattern: string): void {
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

const cache = new MemoryCache();

// Extended API with caching
export const studentApiWithCache = {
  async getStudents(filters = {}, skipCache = false): Promise<any> {
    const cacheKey = `students_${JSON.stringify(filters)}`;
    
    // Try to get from cache first (unless skipCache is true)
    if (!skipCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Call the original API
    const data = await studentApi.getStudents(filters);
    
    // Store in cache
    cache.set(cacheKey, data);
    
    return data;
  },
  
  async getFilterOptions(field: 'location' | 'school' | 'department' | 'section'): Promise<FilterOption[]> {
    const cacheKey = `filter_options_${field}`;
    
    // Try to get from cache
    const cachedOptions = cache.get<FilterOption[]>(cacheKey);
    if (cachedOptions) {
      return cachedOptions;
    }
    
    // Call the original API
    const options = await studentApi.getFilterOptions(field);
    
    // Store in cache with longer duration
    cache.set(cacheKey, options);
    
    return options;
  },
  
  async updateStudentStatus(
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ): Promise<Student> {
    // Call the original API
    const updatedStudent = await studentApi.updateStudentStatus(studentId, status, value);
    
    // Invalidate all student-related caches
    cache.invalidatePatternMatch('students_');
    
    return updatedStudent;
  },
  
  async syncData(): Promise<void> {
    // Call the original API
    await studentApi.syncData();
    
    // Invalidate all caches to ensure fresh data
    cache.invalidatePatternMatch('students_');
    cache.invalidatePatternMatch('filter_options_');
  },
  
  invalidateCache(pattern = ''): void {
    if (pattern) {
      cache.invalidatePatternMatch(pattern);
    } else {
      // Invalidate all student-related caches
      cache.invalidatePatternMatch('students_');
      cache.invalidatePatternMatch('filter_options_');
    }
  }
};
