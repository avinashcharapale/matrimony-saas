export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bio?: string;
  location?: string;
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
}
