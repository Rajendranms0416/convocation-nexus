
export type Role = 'robe-in-charge' | 'folder-in-charge' | 'super-admin' | 'presenter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  program: string;
  hasTakenRobe: boolean;
  hasTakenFolder: boolean;
  hasBeenPresented: boolean;
  attendance: boolean;
}
