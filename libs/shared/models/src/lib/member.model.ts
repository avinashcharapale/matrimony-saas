export interface MemberRecord {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  password?: string;
  age?: number;
  location?: string;
  occupation?: string;
  bio?: string;
  profileCode?: string;
  religionId?: number;
  casteId?: number;
  heightText?: string;
  thumbnailUrl?: string;
  genderId?: number;
  registrationDetails?: RegisterFormDetails;
  createdAt: string;
  createdAtDate?: string;
  dobText?: string;
  nativeDistrictName?: string;
  educationText?: string;
  occupationIncomeText?: string;
}

export interface RegisterSubmissionPayload {
  name: string;
  email: string;
  password: string;
  age?: number;
  location?: string;
  occupation?: string;
  bio?: string;
  registrationDetails?: RegisterFormDetails;
}

export type RegisterDraftSyncStatus = 'local-only' | 'pending-sync' | 'synced' | 'sync-failed';

export interface RegisterDraftState {
  tenantId: string;
  draftId: string;
  currentStep: number;
  updatedAt: number;
  steps: Record<string, Record<string, unknown>>;
  syncStatus?: RegisterDraftSyncStatus;
  syncError?: string;
}

export interface RegisterPersonalDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  gender: string;
  religion: string;
  caste: string;
  subCast: string;
  maritalStatus: string;
  heightFt: string;
  heightIn: string;
  weightKg: string;
  bloodGroup: string;
  complexion: string;
  physicalDisability: string;
  disabilityDetail: string;
  diet: string;
  spectacles: string;
  lens: string;
  personality: string;
}

export interface RegisterHoroscopeDetails {
  manglik: string;
  rashi: string;
  nakshatra: string;
  charan: string;
  nadi: string;
  gan: string;
  birthHour: string;
  birthMinute: string;
  birthPeriod: string;
  birthDistrict: string;
  devak: string;
}

export interface RegisterProfessionalDetails {
  educationArea: string;
  education: string;
  occupationType: string;
  occupationDetails: string;
  workingCityCountry: string;
  incomeAmount: string;
  incomePeriod: string;
}

export interface RegisterContactDetails {
  idProofNumber: string;
  residenceAddress: string;
  contactEmail: string;
  smsMobile: string;
  mobileSecondary: string;
  phonePrimary: string;
  phoneSecondary: string;
}

export interface RegisterFamilyDetails {
  fatherStatus: string;
  motherStatus: string;
  brothers: string;
  marriedBrothers: string;
  sisters: string;
  marriedSisters: string;
  parentsFullName: string;
  parentsOccupation: string;
  parentsResidentCity: string;
  relativesSurnames: string;
  familyWealth: string;
  mamaSurnamePlace: string;
  nativeDistrict: string;
  nativeTaluka: string;
  intercastMarriage: string;
  intercastRelation: string;
}

export interface RegisterExpectationDetails {
  preferredCities: string;
  expectedManglik: string;
  expectedCaste: string;
  maxAgeDifference: string;
  expectedHeightFt: string;
  expectedHeightIn: string;
  expectedEducation: string;
  expectedOccupationIncome: string;
  divorcee: string;
  expectedCasteIds?: number[];
  expectedCasteNoBar?: boolean;
}

export interface RegisterVerificationDetails {
  verificationCode: string;
  verificationInput: string;
}

export interface RegisterPhotoDetails {
  photoSlot: number;
  fileName: string;
  isPrimary?: boolean;
}

export interface RegisterFormDetails {
  personal: RegisterPersonalDetails;
  horoscope: RegisterHoroscopeDetails;
  professional: RegisterProfessionalDetails;
  contact: RegisterContactDetails;
  family: RegisterFamilyDetails;
  expectations: RegisterExpectationDetails;
  verification: RegisterVerificationDetails;
  photos: RegisterPhotoDetails[];
  accountPassword?: string;
  confirmPassword?: string;
}

export function createEmptyRegisterFormDetails(): RegisterFormDetails {
  return {
    personal: {
      firstName: '',
      middleName: '',
      lastName: '',
      dobDay: '',
      dobMonth: '',
      dobYear: '',
      gender: '',
      religion: '',
      caste: '',
      subCast: '',
      maritalStatus: '',
      heightFt: '',
      heightIn: '',
      weightKg: '',
      bloodGroup: '',
      complexion: '',
      physicalDisability: '',
      disabilityDetail: '',
      diet: '',
      spectacles: '',
      lens: '',
      personality: '',
    },
    horoscope: {
      manglik: '',
      rashi: '',
      nakshatra: '',
      charan: '',
      nadi: '',
      gan: '',
      birthHour: '',
      birthMinute: '',
      birthPeriod: '',
      birthDistrict: '',
      devak: '',
    },
    professional: {
      educationArea: '',
      education: '',
      occupationType: '',
      occupationDetails: '',
      workingCityCountry: '',
      incomeAmount: '',
      incomePeriod: '',
    },
    contact: {
      idProofNumber: '',
      residenceAddress: '',
      contactEmail: '',
      smsMobile: '',
      mobileSecondary: '',
      phonePrimary: '',
      phoneSecondary: '',
    },
    family: {
      fatherStatus: '',
      motherStatus: '',
      brothers: '',
      marriedBrothers: '',
      sisters: '',
      marriedSisters: '',
      parentsFullName: '',
      parentsOccupation: '',
      parentsResidentCity: '',
      relativesSurnames: '',
      familyWealth: '',
      mamaSurnamePlace: '',
      nativeDistrict: '',
      nativeTaluka: '',
      intercastMarriage: '',
      intercastRelation: '',
    },
    expectations: {
      preferredCities: '',
      expectedManglik: '',
      expectedCaste: '',
      maxAgeDifference: '',
      expectedHeightFt: '',
      expectedHeightIn: '',
      expectedEducation: '',
      expectedOccupationIncome: '',
      divorcee: '',
    },
    verification: {
      verificationCode: '',
      verificationInput: '',
    },
    photos: [],
    accountPassword: '',
    confirmPassword: '',
  };
}
