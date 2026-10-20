import { MemberRecord, createEmptyRegisterFormDetails } from '@org/models';
import { ProfileListItemDto, ProfileDetailDto } from '@org/generated';
import {
  ProfileDetail,
  ProfileSearchResult,
} from './member.models';

export type CurrencyFormatter = (amount: number) => string;

const MONTH_MAP: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

export function convertToMemberRecord(profile: ProfileSearchResult): MemberRecord {
  return {
    id: `${profile.profileId}`,
    email: profile.email,
    name: profile.fullName,
    lastName: profile.surname,
    age: profile.age,
    occupation: profile.occupationText,
    location: profile.locationText,
    bio: profile.bio,
    profileCode: profile.profileCode,
    religionId: profile.religionId,
    casteId: profile.casteId,
    heightText: profile.heightText,
    thumbnailUrl: profile.thumbnailUrl,
    genderId: profile.genderId,
    createdAt: profile.createdAt,
    createdAtDate: profile.createdAtDate,
    dobText: profile.dobText,
    nativeDistrictName: profile.nativeDistrictName,
    educationText: profile.educationText,
    occupationIncomeText: profile.occupationIncomeText,
    password: '',
  };
}

export function mapListItemToSearchResult(
  profile: ProfileListItemDto,
  formatCurrency?: CurrencyFormatter,
): ProfileSearchResult {
  const heightFt = profile.heightFt ?? undefined;
  const heightIn = profile.heightIn ?? undefined;
  const heightText =
    heightFt != null ? `${heightFt}'${String(heightIn ?? 0).padStart(2, '0')}"` : undefined;

  const dobDay = profile.dobDay ?? undefined;
  const dobYear = profile.dobYear ?? undefined;
  let dobMonthNum: number | undefined;
  if (typeof profile.dobMonth === 'string' && profile.dobMonth) {
    dobMonthNum = MONTH_MAP[profile.dobMonth] ?? parseInt(profile.dobMonth, 10);
  } else if (typeof profile.dobMonth === 'number') {
    dobMonthNum = profile.dobMonth;
  }
  const dobText =
    dobDay != null && dobMonthNum != null && dobYear != null
      ? `${String(dobDay).padStart(2, '0')}/${String(dobMonthNum).padStart(2, '0')}/${dobYear}`
      : undefined;

  const createdAt = profile.createdAt;
  const createdAtDate = createdAt
    ? `${String(new Date(createdAt).getDate()).padStart(2, '0')}/${String(
        new Date(createdAt).getMonth() + 1,
      ).padStart(2, '0')}/${String(new Date(createdAt).getFullYear()).slice(2)}`
    : undefined;

  const parts: string[] = [];
  if (profile.occupationDetails) parts.push(profile.occupationDetails);
  if (profile.workingCity) parts.push(profile.workingCity);
  if (profile.workingCountryName) parts.push(profile.workingCountryName);
  const occupationIncomeText =
    parts.length > 0
      ? parts.join(', ') +
        (profile.incomeAmount && formatCurrency ? ` / ${formatCurrency(profile.incomeAmount)}` : '')
      : profile.occupationText ?? undefined;

  return {
    profileId: profile.profileId ?? 0,
    userId: profile.profileId ?? 0,
    profileCode: profile.profileCode ?? String(profile.profileId ?? ''),
    fullName: profile.fullName ?? '',
    surname: profile.surname ?? undefined,
    age: profile.age ?? undefined,
    bio: undefined,
    locationText: profile.locationText ?? undefined,
    occupationText: profile.occupationText ?? undefined,
    email: '',
    religionId: profile.religionId ?? undefined,
    casteId: profile.casteId ?? undefined,
    heightText,
    thumbnailUrl: profile.thumbnailUrl ?? undefined,
    genderId: profile.genderId ?? undefined,
    createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    createdAtDate,
    dobText,
    nativeDistrictName: profile.nativeDistrictName ?? undefined,
    educationText: profile.educationName ?? undefined,
    occupationIncomeText,
  };
}

export function mapListItemToMemberRecord(item: ProfileListItemDto): MemberRecord {
  const heightText =
    item.heightFt != null
      ? `${item.heightFt}'${String(item.heightIn ?? 0).padStart(2, '0')}"`
      : undefined;
  const createdAt = item.createdAt
    ? new Date(item.createdAt).toISOString()
    : new Date().toISOString();

  return {
    id: `${item.profileId ?? item.userId ?? 0}`,
    name: item.fullName ?? '',
    lastName: item.surname ?? undefined,
    email: '',
    age: item.age ?? undefined,
    occupation: item.occupationText ?? item.occupationDetails ?? undefined,
    location: item.locationText ?? undefined,
    religionId: item.religionId ?? undefined,
    casteId: item.casteId ?? undefined,
    heightText,
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    genderId: item.genderId ?? undefined,
    createdAt,
    nativeDistrictName: item.nativeDistrictName ?? undefined,
    educationText: item.educationName ?? undefined,
  };
}

export function mapProfileDetailToProfileDetail(profile: ProfileDetailDto): ProfileDetail {
  const phones = profile.phoneNumbers ?? [];
  const contactData: Record<string, unknown> | undefined = profile.contact
    ? {
        ContactEmail: profile.contact.contactEmail ?? '',
        ResidenceAddress: profile.contact.residenceAddress ?? '',
        IdProofNumber: profile.contact.idProofNumber ?? '',
        SmsMobile: phones[0]?.phoneNumber ?? '',
        MobileSecondary: phones[1]?.phoneNumber ?? '',
      }
    : undefined;

  const pd = profile.personalDetails;
  const personal: Record<string, unknown> | undefined = pd
    ? {
        FirstName: profile.fullName?.split(' ')[0] ?? '',
        MiddleName: '',
        LastName: profile.fullName?.split(' ').slice(-1)[0] ?? '',
        DobDay: pd.dobDay,
        DobMonth: pd.dobMonth,
        DobYear: pd.dobYear,
        GenderId: pd.genderId,
        ReligionId: pd.religionId,
        CasteId: pd.casteId,
        SubCasteId: pd.subCasteId,
        MaritalStatusId: pd.maritalStatusId,
        Gender: pd.genderName ?? '',
        Religion: pd.religionName ?? '',
        Caste: pd.casteName ?? '',
        SubCast: pd.subCasteName ?? '',
        MaritalStatus: pd.maritalStatusName ?? '',
        HeightFt: pd.heightFt,
        HeightIn: pd.heightIn,
        WeightKg: pd.weightKg,
        BloodGroup: pd.bloodGroupName ?? '',
        Complexion: pd.complexionName ?? '',
        Diet: pd.dietName ?? '',
        Personality: pd.personalityName ?? '',
        Spectacles: pd.spectacles,
        Lens: pd.lens,
        PhysicalDisability: pd.physicalDisability,
        DisabilityDetail: pd.disabilityDetail ?? '',
      }
    : undefined;

  const hd = profile.horoscope;
  const horoscope: Record<string, unknown> | undefined = hd
    ? {
        Manglik: hd.manglik,
        Rashi: hd.rashiName ?? '',
        Nakshatra: hd.nakshatraName ?? '',
        Charan: hd.charanName ?? '',
        Nadi: hd.nadiName ?? '',
        Gan: hd.ganName ?? '',
        BirthHour: hd.birthHour,
        BirthMinute: hd.birthMinute,
        BirthPeriod: hd.birthPeriod ?? '',
        BirthDistrict: hd.birthDistrictName ?? '',
        Devak: hd.devak ?? '',
      }
    : undefined;

  const cd = profile.career;
  const professional: Record<string, unknown> | undefined = cd
    ? {
        EducationArea: cd.educationAreaName ?? '',
        Education: cd.educationName ?? '',
        OccupationType: cd.occupationName ?? '',
        OccupationDetails: cd.occupationDetails ?? '',
        WorkingCityCountry: [cd.workingCity, cd.workingStateName, cd.workingCountryName]
          .filter(Boolean)
          .join(', '),
        IncomeAmount: cd.incomeAmount,
        IncomePeriod: cd.incomePeriodName ?? '',
      }
    : undefined;

  const fd = profile.familyInfo;
  const family: Record<string, unknown> | undefined = fd
    ? {
        FatherStatus: fd.fatherStatus,
        MotherStatus: fd.motherStatus,
        Brothers: fd.brothers,
        MarriedBrothers: fd.marriedBrothers,
        Sisters: fd.sisters,
        MarriedSisters: fd.marriedSisters,
        ParentsFullName: fd.parentsFullName ?? '',
        ParentsOccupation: fd.parentsOccupation ?? '',
        ParentsResidentCity: fd.parentsResidentCity ?? '',
        FamilyWealth: fd.familyWealth ?? '',
        MamaSurnamePlace: fd.mamaSurnamePlace ?? '',
        NativeDistrict: fd.nativeDistrictName ?? '',
        NativeTaluka: fd.nativeTalukaName ?? '',
        IntercastMarriage: fd.intercastMarriage,
        IntercastRelation: fd.intercastRelation ?? '',
        RelativesSurnames: (profile.relativeSurnames ?? []).join(', '),
      }
    : undefined;

  const pp = profile.partnerPreference;
  const expectedCities = (profile.preferredCities ?? []).join(', ');
  const expectations: Record<string, unknown> | undefined = pp
    ? {
        MaxAgeDifference: pp.maxAgeDifference,
        ExpectedHeightFt: pp.expectedHeightFt,
        ExpectedHeightIn: pp.expectedHeightIn,
        ExpectedManglik: pp.expectedManglik,
        Divorcee: pp.divorcee,
        PreferredCities: expectedCities,
        ExpectedCasteIds: profile.expectedCasteIds ?? [],
        ExpectedCasteNoBar: pp.expectedCasteNoBar ?? false,
        ExpectedEducationIds: profile.expectedEducationIds ?? [],
        ExpectedEducationNoBar: pp.expectedEducationNoBar ?? false,
        ExpectedOccupationIds: profile.expectedOccupationIds ?? [],
        ExpectedOccupationNoBar: pp.expectedOccupationNoBar ?? false,
      }
    : { PreferredCities: expectedCities };

  const photos = (profile.photos ?? []).map((p) => ({
    PhotoSlot: p.photoSlot,
    FileName: p.fileName ?? '',
    FileUrl: p.fileUrl ?? p.fileName ?? '',
    IsPrimary: p.isPrimary,
  }));

  return {
    profileId: profile.profileId ?? 0,
    userId: profile.profileId ?? 0,
    profileCode: String(profile.profileCode ?? profile.profileId ?? ''),
    fullName: profile.fullName ?? '',
    age: profile.age ?? undefined,
    bio: profile.bio ?? undefined,
    locationText: profile.locationText ?? undefined,
    occupationText: profile.occupationText ?? undefined,
    email: '',
    createdAt: new Date().toISOString(),
    isContactUnlocked: profile.isContactUnlocked ?? false,
    contact: contactData,
    personal,
    horoscope,
    professional,
    family,
    expectations,
    photos,
    canViewEducation: profile.canViewEducation ?? true,
    canViewOccupation: profile.canViewOccupation ?? true,
    canViewFamily: profile.canViewFamily ?? true,
    canViewHoroscope: profile.canViewHoroscope ?? true,
    canViewPhotos: profile.canViewPhotos ?? true,
  };
}

export function mapDtoToRegistrationMemberRecord(dto: ProfileDetailDto): MemberRecord {
  const pd = dto.personalDetails;
  const photos = (dto.photos ?? []).map((p) => ({
    photoSlot: p.photoSlot ?? 0,
    fileName: p.fileName ?? '',
    fileUrl: p.fileUrl ?? p.fileName ?? '',
    isPrimary: p.isPrimary ?? false,
  }));

  return {
    id: `${dto.profileId ?? 0}`,
    profileCode: dto.profileCode ?? String(dto.profileId ?? ''),
    email: dto.contact?.contactEmail ?? '',
    name: dto.fullName ?? '',
    age: dto.age ?? undefined,
    occupation: dto.occupationText ?? undefined,
    location: dto.locationText ?? undefined,
    bio: dto.bio ?? undefined,
    createdAt: dto.lastActiveAt ?? new Date().toISOString(),
    password: '',
    planVisibility: {
      canViewEducation: dto.canViewEducation ?? true,
      canViewOccupation: dto.canViewOccupation ?? true,
      canViewFamily: dto.canViewFamily ?? true,
      canViewHoroscope: dto.canViewHoroscope ?? true,
      canViewPhotos: dto.canViewPhotos ?? true,
    },
    isContactUnlocked: dto.isContactUnlocked ?? false,
    registrationDetails: {
      ...createEmptyRegisterFormDetails(),
      personal: {
        firstName: dto.fullName?.split(' ')[0] ?? '',
        middleName: '',
        lastName: dto.fullName?.split(' ').slice(1).join(' ') ?? '',
        dobDay: `${pd?.dobDay ?? ''}`,
        dobMonth: pd?.dobMonth ?? '',
        dobYear: `${pd?.dobYear ?? ''}`,
        gender: `${pd?.genderId ?? ''}`,
        religion: pd?.religionName ?? '',
        caste: pd?.casteName ?? '',
        subCast: pd?.subCasteName ?? '',
        maritalStatus: pd?.maritalStatusName ?? '',
        heightFt: `${pd?.heightFt ?? ''}`,
        heightIn: `${pd?.heightIn ?? ''}`,
        weightKg: `${pd?.weightKg ?? ''}`,
        bloodGroup: pd?.bloodGroupName ?? '',
        complexion: pd?.complexionName ?? '',
        physicalDisability: pd?.physicalDisability ? 'Yes' : 'No',
        disabilityDetail: pd?.disabilityDetail ?? '',
        diet: pd?.dietName ?? '',
        spectacles: pd?.spectacles ? 'Yes' : 'No',
        lens: pd?.lens ? 'Yes' : 'No',
        personality: pd?.personalityName ?? '',
      },
      horoscope: {
        manglik: dto.horoscope?.manglik ? 'Yes' : 'No',
        rashi: dto.horoscope?.rashiName ?? '',
        nakshatra: dto.horoscope?.nakshatraName ?? '',
        charan: dto.horoscope?.charanName ?? '',
        nadi: dto.horoscope?.nadiName ?? '',
        gan: dto.horoscope?.ganName ?? '',
        birthHour: `${dto.horoscope?.birthHour ?? ''}`,
        birthMinute: `${dto.horoscope?.birthMinute ?? ''}`,
        birthPeriod: dto.horoscope?.birthPeriod ?? '',
        birthState: `${dto.horoscope?.birthStateId ?? ''}`,
        birthStateOther: dto.horoscope?.birthStateOther ?? '',
        birthDistrict: dto.horoscope?.birthDistrictName ?? '',
        birthDistrictOther: dto.horoscope?.birthDistrictOther ?? '',
        devak: dto.horoscope?.devak ?? '',
      },
      professional: {
        educationArea: dto.career?.educationAreaName ?? '',
        education: dto.career?.educationName ?? '',
        occupationType: dto.career?.occupationName ?? '',
        occupationDetails: dto.career?.occupationDetails ?? '',
        workingCityCountry: [dto.career?.workingCity, dto.career?.workingStateName, dto.career?.workingCountryName].filter(Boolean).join(', '),
        workingState: `${dto.career?.workingStateId ?? ''}`,
        workingStateOther: dto.career?.workingStateOther ?? '',
        workingCountry: `${dto.career?.workingCountryId ?? ''}`,
        workingCountryOther: dto.career?.workingCountryOther ?? '',
        incomeAmount: `${dto.career?.incomeAmount ?? ''}`,
        incomePeriod: dto.career?.incomePeriodName ?? '',
      },
      contact: {
        idProofNumber: dto.contact?.idProofNumber ?? '',
        residenceAddress: dto.contact?.residenceAddress ?? '',
        contactEmail: dto.contact?.contactEmail ?? '',
        smsMobile: dto.phoneNumbers?.[0]?.phoneNumber ?? '',
        mobileSecondary: dto.phoneNumbers?.[1]?.phoneNumber ?? '',
        phonePrimary: dto.phoneNumbers?.[2]?.phoneNumber ?? '',
        phoneSecondary: dto.phoneNumbers?.[3]?.phoneNumber ?? '',
      },
      family: {
        fatherStatus: dto.familyInfo?.fatherStatus ? 'Yes' : 'No',
        motherStatus: dto.familyInfo?.motherStatus ? 'Yes' : 'No',
        brothers: `${dto.familyInfo?.brothers ?? ''}`,
        marriedBrothers: `${dto.familyInfo?.marriedBrothers ?? ''}`,
        sisters: `${dto.familyInfo?.sisters ?? ''}`,
        marriedSisters: `${dto.familyInfo?.marriedSisters ?? ''}`,
        parentsFullName: dto.familyInfo?.parentsFullName ?? '',
        parentsOccupation: dto.familyInfo?.parentsOccupation ?? '',
        parentsResidentCity: dto.familyInfo?.parentsResidentCity ?? '',
        relativesSurnames: (dto.relativeSurnames ?? []).join(', '),
        familyWealth: dto.familyInfo?.familyWealth ?? '',
        mamaSurnamePlace: dto.familyInfo?.mamaSurnamePlace ?? '',
        nativeState: '',
        nativeStateOther: '',
        nativeDistrict: dto.familyInfo?.nativeDistrictName ?? '',
        nativeDistrictOther: dto.familyInfo?.nativeDistrictOther ?? '',
        nativeTaluka: dto.familyInfo?.nativeTalukaName ?? '',
        nativeTalukaOther: dto.familyInfo?.nativeTalukaOther ?? '',
        intercastMarriage: dto.familyInfo?.intercastMarriage ? 'Yes' : 'No',
        intercastRelation: dto.familyInfo?.intercastRelation ?? '',
      },
      expectations: {
        preferredCities: (dto.preferredCities ?? []).join(', '),
        expectedManglik: dto.partnerPreference?.expectedManglik ? 'Yes' : 'No',
        expectedCaste: '',
        maxAgeDifference: `${dto.partnerPreference?.maxAgeDifference ?? ''}`,
        expectedHeightFt: `${dto.partnerPreference?.expectedHeightFt ?? ''}`,
        expectedHeightIn: `${dto.partnerPreference?.expectedHeightIn ?? ''}`,
        expectedEducation: '',
        expectedOccupationIncome: '',
        divorcee: dto.partnerPreference?.divorcee ? 'Yes' : 'No',
        expectedCasteIds: dto.expectedCasteIds ?? undefined,
        expectedCasteNoBar: dto.partnerPreference?.expectedCasteNoBar ?? undefined,
        expectedEducationIds: dto.expectedEducationIds ?? undefined,
        expectedEducationNoBar: dto.partnerPreference?.expectedEducationNoBar ?? undefined,
        expectedOccupationIds: dto.expectedOccupationIds ?? undefined,
        expectedOccupationNoBar: dto.partnerPreference?.expectedOccupationNoBar ?? undefined,
        expectedIncomeRangeId: `${dto.partnerPreference?.expectedIncomeRangeId ?? ''}`,
      },
      photos,
    },
  };
}
