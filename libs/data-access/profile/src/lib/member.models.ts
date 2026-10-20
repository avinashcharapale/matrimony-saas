export interface SearchFilters {
  name: string;
  location: string;
  occupation: string;
  genderId?: number;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  caste?: string;
  education?: string;
  educationId?: number;
  occupationId?: number;
  workingCity?: string;
  nativePlace?: string;
  maritalStatus?: string;
  annualIncomeFrom?: number;
  annualIncomeTo?: number;
  heightFromFt?: number;
  heightFromIn?: number;
  heightToFt?: number;
  heightToIn?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface RegisterMemberResult {
  ok: boolean;
  message: string;
  profileSynced: boolean;
}

export interface ProfileSearchResult {
  profileId: number;
  userId: number;
  profileCode: string;
  fullName: string;
  surname?: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  email: string;
  religionId?: number;
  casteId?: number;
  heightText?: string;
  thumbnailUrl?: string;
  genderId?: number;
  createdAt: string;
  createdAtDate?: string;
  dobText?: string;
  nativeDistrictName?: string;
  educationText?: string;
  occupationIncomeText?: string;
  isContactUnlocked?: boolean;
}

export interface ProfileListResponse {
  profiles: ProfileSearchResult[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProfileDetail extends ProfileSearchResult {
  personal?: Record<string, unknown>;
  horoscope?: Record<string, unknown>;
  professional?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  family?: Record<string, unknown>;
  expectations?: Record<string, unknown>;
  verification?: Record<string, unknown>;
  photos?: Array<Record<string, unknown>>;
  canViewEducation?: boolean;
  canViewOccupation?: boolean;
  canViewFamily?: boolean;
  canViewHoroscope?: boolean;
  canViewPhotos?: boolean;
}
