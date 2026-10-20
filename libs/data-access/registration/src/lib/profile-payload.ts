import { CreateProfileDto } from '@org/generated';
import {
  RegisterFormDetails,
  RegisterSubmissionPayload,
  createEmptyRegisterFormDetails,
} from '@org/models';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('error' in error)) {
    return fallback;
  }

  const payload = (error as { error?: unknown }).error;
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const apiError = (payload as { error?: unknown }).error;
  if (typeof apiError === 'string' && apiError.trim().length > 0) {
    return apiError;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  const errors = (payload as { errors?: unknown }).errors;
  if (errors && typeof errors === 'object') {
    const fieldErrors = Object.entries(errors as Record<string, unknown>)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value
            .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
            .map((entry) => `${field}: ${entry}`);
        }
        if (typeof value === 'string' && value.trim().length > 0) {
          return [`${field}: ${value}`];
        }
        return [];
      });

    if (fieldErrors.length > 0) {
      return fieldErrors.join(' | ');
    }
  }

  const title = (payload as { title?: unknown }).title;
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }

  return fallback;
}

function computeAge(details: RegisterFormDetails): number | undefined {
  const birthYear = Number(details.personal.dobYear);
  if (!Number.isFinite(birthYear) || birthYear <= 0) {
    return undefined;
  }

  return new Date().getFullYear() - birthYear;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

function splitList(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const items = value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function parseIdList(value?: number[] | string | null): number[] | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const raw = Array.isArray(value) ? value : String(value).split(',');
  const ids = raw
    .map((entry) => Number(`${entry}`.trim()))
    .filter((entry) => Number.isFinite(entry) && entry > 0);
  return ids.length > 0 ? ids : undefined;
}

export function buildProfilePayload(payload: RegisterSubmissionPayload): CreateProfileDto {
  const details = payload.registrationDetails ?? createEmptyRegisterFormDetails();
  const fullName = payload.name || [
    details.personal.firstName,
    details.personal.middleName,
    details.personal.lastName,
  ].filter(Boolean).join(' ');

  const phoneNumbers = [
    details.contact.smsMobile ? { phoneType: 'sms_mobile', phoneNumber: details.contact.smsMobile } : null,
    details.contact.mobileSecondary ? { phoneType: 'mobile_secondary', phoneNumber: details.contact.mobileSecondary } : null,
    details.contact.phonePrimary ? { phoneType: 'phone_primary', phoneNumber: details.contact.phonePrimary } : null,
    details.contact.phoneSecondary ? { phoneType: 'phone_secondary', phoneNumber: details.contact.phoneSecondary } : null,
  ].filter((p): p is { phoneType: string; phoneNumber: string } => p !== null);

  const relativeSurnames = splitList(details.family.relativesSurnames);
  const preferredCities = splitList(details.expectations.preferredCities);
  const interests = splitList(details.interests);
  const expectedCasteIds = parseIdList(details.expectations.expectedCasteIds);
  const expectedEducationIds = parseIdList(details.expectations.expectedEducationIds);
  const expectedOccupationIds = parseIdList(details.expectations.expectedOccupationIds);

  const workingStateId = toOptionalNumber(details.professional.workingState);
  const workingCountryId = toOptionalNumber(details.professional.workingCountry);
  const birthStateId = toOptionalNumber(details.horoscope.birthState);
  const birthDistrictId = toOptionalNumber(details.horoscope.birthDistrict);
  const nativeDistrictId = toOptionalNumber(details.family.nativeDistrict);
  const nativeTalukaId = toOptionalNumber(details.family.nativeTaluka);
  const expectedIncomeRangeId = toOptionalNumber(details.expectations.expectedIncomeRangeId);

  return {
    fullName,
    age: payload.age ?? computeAge(details),
    bio: payload.bio,
    locationText: payload.location || details.contact.residenceAddress || details.professional.workingCityCountry,
    occupationText: payload.occupation || details.professional.occupationDetails,
    personalDetails: {
      firstName: details.personal.firstName,
      middleName: details.personal.middleName,
      lastName: details.personal.lastName,
      dobDay: toOptionalNumber(details.personal.dobDay),
      dobMonth: details.personal.dobMonth,
      dobYear: toOptionalNumber(details.personal.dobYear),
      genderId: toOptionalNumber(details.personal.gender),
      religionId: toOptionalNumber(details.personal.religion),
      casteId: toOptionalNumber(details.personal.caste),
      subCasteId: toOptionalNumber(details.personal.subCast),
      maritalStatusId: toOptionalNumber(details.personal.maritalStatus),
      heightFt: toOptionalNumber(details.personal.heightFt),
      heightIn: toOptionalNumber(details.personal.heightIn),
      weightKg: toOptionalNumber(details.personal.weightKg),
      bloodGroupId: toOptionalNumber(details.personal.bloodGroup),
      complexionId: toOptionalNumber(details.personal.complexion),
      physicalDisability: toOptionalBoolean(details.personal.physicalDisability),
      disabilityDetail: details.personal.disabilityDetail,
      dietId: toOptionalNumber(details.personal.diet),
      spectacles: toOptionalBoolean(details.personal.spectacles),
      lens: toOptionalBoolean(details.personal.lens),
      personalityId: toOptionalNumber(details.personal.personality),
    },
    careerDetails: {
      educationAreaId: toOptionalNumber(details.professional.educationArea),
      educationId: toOptionalNumber(details.professional.education),
      occupationId: toOptionalNumber(details.professional.occupationType),
      occupationDetails: details.professional.occupationDetails,
      workingCity: details.professional.workingCityCountry,
      workingStateId,
      workingStateOther: workingStateId ? undefined : details.professional.workingStateOther || undefined,
      workingCountryId,
      workingCountryOther: workingCountryId ? undefined : details.professional.workingCountryOther || undefined,
      incomeAmount: toOptionalNumber(details.professional.incomeAmount),
      incomePeriodId: toOptionalNumber(details.professional.incomePeriod),
    },
    contactDetails: {
      idProofNumber: details.contact.idProofNumber,
      residenceAddress: details.contact.residenceAddress,
      contactEmail: details.contact.contactEmail || payload.email,
    },
    phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
    familyDetails: {
      fatherStatus: toOptionalBoolean(details.family.fatherStatus),
      motherStatus: toOptionalBoolean(details.family.motherStatus),
      brothers: toOptionalNumber(details.family.brothers),
      marriedBrothers: toOptionalNumber(details.family.marriedBrothers),
      sisters: toOptionalNumber(details.family.sisters),
      marriedSisters: toOptionalNumber(details.family.marriedSisters),
      parentsFullName: details.family.parentsFullName,
      parentsOccupation: details.family.parentsOccupation,
      parentsResidentCity: details.family.parentsResidentCity,
      familyWealth: details.family.familyWealth,
      mamaSurnamePlace: details.family.mamaSurnamePlace,
      nativeDistrictId,
      nativeDistrictOther: nativeDistrictId ? undefined : details.family.nativeDistrictOther || undefined,
      nativeTalukaId,
      nativeTalukaOther: nativeTalukaId ? undefined : details.family.nativeTalukaOther || undefined,
      intercastMarriage: toOptionalBoolean(details.family.intercastMarriage),
      intercastRelation: details.family.intercastRelation,
    },
    relativeSurnames,
    partnerPreference: {
      expectedManglik: toOptionalBoolean(details.expectations.expectedManglik),
      maxAgeDifference: toOptionalNumber(details.expectations.maxAgeDifference),
      expectedHeightFt: toOptionalNumber(details.expectations.expectedHeightFt),
      expectedHeightIn: toOptionalNumber(details.expectations.expectedHeightIn),
      divorcee: toOptionalBoolean(details.expectations.divorcee),
      expectedCasteNoBar: details.expectations.expectedCasteNoBar ?? false,
      expectedEducationNoBar: details.expectations.expectedEducationNoBar ?? false,
      expectedOccupationNoBar: details.expectations.expectedOccupationNoBar ?? false,
      expectedIncomeRangeId,
    },
    profileHoroscope: {
      manglik: toOptionalBoolean(details.horoscope.manglik),
      birthHour: toOptionalNumber(details.horoscope.birthHour),
      birthMinute: toOptionalNumber(details.horoscope.birthMinute),
      birthPeriod: details.horoscope.birthPeriod,
      devak: details.horoscope.devak,
      rashiId: toOptionalNumber(details.horoscope.rashi),
      nakshatraId: toOptionalNumber(details.horoscope.nakshatra),
      charanId: toOptionalNumber(details.horoscope.charan),
      nadiId: toOptionalNumber(details.horoscope.nadi),
      ganId: toOptionalNumber(details.horoscope.gan),
      birthStateId,
      birthStateOther: birthStateId ? undefined : details.horoscope.birthStateOther || undefined,
      birthDistrictId,
      birthDistrictOther: birthDistrictId ? undefined : details.horoscope.birthDistrictOther || undefined,
    },
    profilePhotos: details.photos
      .filter((photo) => photo.fileName.trim().length > 0)
      .map((photo, index) => ({
        photoSlot: photo.photoSlot || index + 1,
        fileName: photo.fileName,
        isPrimary: photo.isPrimary ?? index === 0,
      })),
    interests,
    preferredCities,
    expectedCasteIds,
    expectedEducationIds,
    expectedOccupationIds,
  };
}