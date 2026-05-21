export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
