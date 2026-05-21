import { MemberRecord, RegisterFormDetails, createEmptyRegisterFormDetails } from './member.model';

type RegisterFormOverride = Partial<Omit<RegisterFormDetails, 'personal' | 'horoscope' | 'professional' | 'contact' | 'family' | 'expectations' | 'verification' | 'photos'>> & {
  personal?: Partial<RegisterFormDetails['personal']>;
  horoscope?: Partial<RegisterFormDetails['horoscope']>;
  professional?: Partial<RegisterFormDetails['professional']>;
  contact?: Partial<RegisterFormDetails['contact']>;
  family?: Partial<RegisterFormDetails['family']>;
  expectations?: Partial<RegisterFormDetails['expectations']>;
  verification?: Partial<RegisterFormDetails['verification']>;
  photos?: RegisterFormDetails['photos'];
};

function createDummyRegistration(overrides: RegisterFormOverride): RegisterFormDetails {
  return {
    ...createEmptyRegisterFormDetails(),
    ...overrides,
    personal: {
      ...createEmptyRegisterFormDetails().personal,
      ...overrides.personal,
    },
    horoscope: {
      ...createEmptyRegisterFormDetails().horoscope,
      ...overrides.horoscope,
    },
    professional: {
      ...createEmptyRegisterFormDetails().professional,
      ...overrides.professional,
    },
    contact: {
      ...createEmptyRegisterFormDetails().contact,
      ...overrides.contact,
    },
    family: {
      ...createEmptyRegisterFormDetails().family,
      ...overrides.family,
    },
    expectations: {
      ...createEmptyRegisterFormDetails().expectations,
      ...overrides.expectations,
    },
    verification: {
      ...createEmptyRegisterFormDetails().verification,
      ...overrides.verification,
    },
    photos: overrides.photos ?? createEmptyRegisterFormDetails().photos,
  };
}

export const SAMPLE_PROFILES: MemberRecord[] = [
  {
    id: 'sample-1',
    name: 'Rajesh Patil',
    email: 'rajesh.patil@example.com',
    password: '',
    age: 32,
    location: 'Pune',
    occupation: 'Civil Engineer',
    bio: 'Family-oriented and looking for a meaningful long-term relationship.',
    registrationDetails: createDummyRegistration({
      personal: {
        firstName: 'Rajesh',
        lastName: 'Patil',
        dobDay: '17',
        dobMonth: '10',
        dobYear: '1993',
        religion: 'HINDU',
        caste: 'Maratha',
        subCast: '96 Kuli Maratha',
        maritalStatus: 'Unmarried',
        heightFt: '5',
        heightIn: '8',
        weightKg: '65',
        bloodGroup: 'A+',
        complexion: 'Fair',
        diet: 'Non Vegetarian',
        spectacles: 'No',
        lens: 'No',
      },
      horoscope: {
        manglik: 'No',
        rashi: 'Tula',
        nakshatra: 'Swati',
        charan: '2',
        birthDistrict: 'Kolhapur',
        devak: 'Pachpalavi',
      },
      professional: {
        education: 'Mechanical Engineering',
        occupationDetails: 'Design Engineer Pune / 6 LPA',
      },
      family: {
        fatherStatus: 'Yes',
        motherStatus: 'Yes',
        brothers: '0',
        sisters: '1',
        mamaSurnamePlace: 'Patil, Kolhapur',
        nativeDistrict: 'Kolhapur',
        nativeTaluka: 'Karveer',
        relativesSurnames: 'Patil, Chavan, Shinde',
        parentsResidentCity: 'At Post - Chuye',
        familyWealth: 'Homeland',
      },
      expectations: {
        maxAgeDifference: '4',
        expectedHeightFt: '5',
        expectedHeightIn: '3',
        expectedEducation: 'BE, BTech, BCA, MSc',
        expectedOccupationIncome: 'Service / Business',
        expectedCaste: '96 Kuli Maratha',
        divorcee: 'No',
        expectedManglik: 'No',
        preferredCities: 'Kolhapur, Satara, Sangli',
      },
      photos: [
        { photoSlot: 1, fileName: 'photo1.jpg', isPrimary: true },
        { photoSlot: 2, fileName: 'photo2.jpg' },
      ],
    }),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Priya Shinde',
    email: 'priya.shinde@example.com',
    password: '',
    age: 29,
    location: 'Nashik',
    occupation: 'IT Professional',
    bio: 'Enjoys reading, music, and value-based conversations.',
    registrationDetails: createDummyRegistration({
      personal: {
        firstName: 'Priya',
        lastName: 'Shinde',
        dobDay: '22',
        dobMonth: '04',
        dobYear: '1996',
        religion: 'HINDU',
        subCast: 'Maratha',
        maritalStatus: 'Unmarried',
        heightFt: '5',
        heightIn: '4',
        bloodGroup: 'B+',
        complexion: 'Wheatish',
        diet: 'Vegetarian',
      },
      horoscope: {
        manglik: 'No',
      },
      professional: {
        education: 'B.E. Computer',
        occupationDetails: 'Software Engineer / 9 LPA',
      },
      family: {
        fatherStatus: 'Yes',
        motherStatus: 'Yes',
        sisters: '1',
      },
      expectations: {
        expectedHeightFt: '5',
        expectedHeightIn: '7',
        expectedEducation: 'Graduate',
        expectedCaste: 'Maratha',
        preferredCities: 'Nashik, Pune, Mumbai',
      },
    }),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Akash Gaikwad',
    email: 'akash.gaikwad@example.com',
    password: '',
    age: 30,
    location: 'Mumbai',
    occupation: 'Doctor',
    bio: 'Looking for a partner with shared family values and goals.',
    registrationDetails: createDummyRegistration({
      personal: {
        firstName: 'Akash',
        lastName: 'Gaikwad',
        dobDay: '05',
        dobMonth: '01',
        dobYear: '1995',
        religion: 'HINDU',
        subCast: 'Maratha',
        maritalStatus: 'Unmarried',
        heightFt: '5',
        heightIn: '10',
        bloodGroup: 'O+',
        diet: 'Non Vegetarian',
      },
      horoscope: {
        manglik: 'Yes',
      },
      professional: {
        education: 'MBBS, MD',
        occupationDetails: 'Consultant Physician',
      },
      family: {
        fatherStatus: 'Retired',
        motherStatus: 'Homemaker',
        brothers: '1',
      },
      expectations: {
        expectedEducation: 'Graduate / Post Graduate',
        preferredCities: 'Mumbai, Pune',
      },
    }),
    createdAt: new Date().toISOString(),
  },
];
