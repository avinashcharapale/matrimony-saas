export interface Profile {
  id: string;
  userId: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bio?: string;
  location?: string;
  occupation?: string;
  education?: string;
  hobbies?: string[];
  religion?: string;
  caste?: string;
  height?: string;
  motherTongue?: string;
  maritalStatus: 'Single' | 'Divorced' | 'Widowed' | 'Separated';
  profileImageUrl?: string;
  galleryImages?: string[];
  aboutMe?: string;
  expectations?: string;
  verified: boolean;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
