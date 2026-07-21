// ─── Identity DTOs ────────────────────────────────────────────────────────────

export interface RegisterRequestDto {
  email?: string;
  password?: string;
  confirmPassword?: string;
  tenantId?: number;
}

export interface LoginRequestDto {
  email?: string;
  password?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  userId: number;
  tenantId: number;
  role: string;
  expiresAt: string;
}

export interface RefreshTokenRequestDto {
  accessToken?: string;
  refreshToken?: string;
}

export interface CreateUserRequestDto {
  tenantId?: number;
  email?: string;
  password?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
}

export interface UpdateUserRequestDto {
  email?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

export interface UserDetailDto {
  id?: number;
  tenantId?: number;
  email?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: string[];
  permissions?: string[];
}

export interface UserListDto {
  id?: number;
  tenantId?: number;
  email?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

// ─── Profile DTOs ─────────────────────────────────────────────────────────────

export interface MasterDataOptionDto {
  id?: number;
  name?: string;
}

export interface MasterDataItemDto {
  masterDataId: number;
  category: string;
  valueCode: string;
  sortOrder: number;
  label: string;
}

export interface PersonalDetailsDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dobDay?: number;
  dobMonth?: string;
  dobYear?: number;
  dateOfBirth?: string;
  genderId?: number;
  religionId?: number;
  casteId?: number;
  subCasteId?: number;
  maritalStatusId?: number;
  countryId?: number;
  stateId?: number;
  districtId?: number;
  talukaId?: number;
  heightFt?: number;
  heightIn?: number;
  weightKg?: number;
  bloodGroupId?: number;
  complexionId?: number;
  dietId?: number;
  personalityId?: number;
  physicalDisability?: boolean;
  disabilityDetail?: string;
  spectacles?: boolean;
  lens?: boolean;
}

export interface PersonalDetailsViewDto {
  dobDay?: number;
  dobMonth?: string;
  dobYear?: number;
  genderId?: number;
  religionId?: number;
  casteId?: number;
  subCasteId?: number;
  maritalStatusId?: number;
  heightFt?: number;
  heightIn?: number;
  weightKg?: number;
  bloodGroupId?: number;
  complexionId?: number;
  dietId?: number;
  personalityId?: number;
  physicalDisability?: boolean;
  disabilityDetail?: string;
  spectacles?: boolean;
  lens?: boolean;
  genderName?: string;
  religionName?: string;
  casteName?: string;
  subCasteName?: string;
  maritalStatusName?: string;
  bloodGroupName?: string;
  complexionName?: string;
  dietName?: string;
  personalityName?: string;
}

export interface ContactDetailsDto {
  contactEmail?: string;
  residenceAddress?: string;
  idProofNumber?: string;
}

export interface ContactDetailsDtoCreate {
  residenceAddress?: string;
  contactEmail?: string;
  idProofNumber?: string;
}

export interface PhoneNumberDto {
  phoneType?: string;
  phoneNumber?: string;
}

export interface FamilyDetailsDto {
  fatherStatus?: boolean;
  motherStatus?: boolean;
  brothers?: number;
  marriedBrothers?: number;
  sisters?: number;
  marriedSisters?: number;
  parentsFullName?: string;
  parentsOccupation?: string;
  parentsResidentCity?: string;
  familyWealth?: string;
  mamaSurnamePlace?: string;
  nativeDistrictId?: number;
  nativeDistrictOther?: string;
  nativeTalukaId?: number;
  nativeTalukaOther?: string;
  intercastMarriage?: boolean;
  intercastRelation?: string;
  nativeDistrictName?: string;
  nativeTalukaName?: string;
}

export interface CareerDetailsDtoCreate {
  educationId?: number;
  educationAreaId?: number;
  occupationId?: number;
  occupationDetails?: string;
  workingCity?: string;
  workingStateId?: number;
  workingStateOther?: string;
  workingCountryId?: number;
  workingCountryOther?: string;
  incomeAmount?: number;
  incomePeriodId?: number;
}

export interface CareerDetailsViewDto {
  educationId?: number;
  educationAreaId?: number;
  occupationId?: number;
  occupationDetails?: string;
  workingCity?: string;
  workingStateId?: number;
  workingStateOther?: string;
  workingCountryId?: number;
  workingCountryOther?: string;
  incomeAmount?: number;
  incomePeriodId?: number;
  educationAreaName?: string;
  educationName?: string;
  occupationName?: string;
  incomePeriodName?: string;
  workingStateName?: string;
  workingCountryName?: string;
}

export interface PartnerPreferenceDto {
  expectedManglik?: boolean;
  maxAgeDifference?: number;
  expectedHeightFt?: number;
  expectedHeightIn?: number;
  divorcee?: boolean;
  expectedCasteNoBar?: boolean;
  expectedEducationNoBar?: boolean;
  expectedOccupationNoBar?: boolean;
  expectedIncomeRangeId?: number;
}

export interface ProfilePhotoDto {
  photoId?: number;
  photoSlot?: number;
  fileUrl?: string;
  fileName?: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface ProfilePhotoDtoCreate {
  photoSlot?: number;
  fileName?: string;
  fileUrl?: string;
  isPrimary?: boolean;
}

export interface ProfileHoroscopeDetailDto {
  manglik?: boolean;
  birthHour?: number;
  birthMinute?: number;
  birthPeriod?: string;
  devak?: string;
  rashiId?: number;
  nakshatraId?: number;
  charanId?: number;
  nadiId?: number;
  ganId?: number;
  birthStateId?: number;
  birthStateOther?: string;
  birthDistrictId?: number;
  birthDistrictOther?: string;
  rashiName?: string;
  nakshatraName?: string;
  charanName?: string;
  nadiName?: string;
  ganName?: string;
  birthStateName?: string;
  birthDistrictName?: string;
}

export interface CreateProfileDto {
  fullName?: string | null;
  age?: number | null;
  bio?: string | null;
  locationText?: string | null;
  occupationText?: string | null;
  personalDetails?: PersonalDetailsDto;
  contactDetails?: ContactDetailsDtoCreate;
  phoneNumbers?: PhoneNumberDto[];
  familyDetails?: FamilyDetailsDto;
  relativeSurnames?: string[];
  careerDetails?: CareerDetailsDtoCreate;
  partnerPreference?: PartnerPreferenceDto;
  profilePhotos?: ProfilePhotoDtoCreate[];
  profileHoroscope?: ProfileHoroscopeDetailDto;
  interests?: string[];
  preferredCities?: string[];
  expectedCasteIds?: number[];
  expectedEducationIds?: number[];
  expectedOccupationIds?: number[];
}

export interface ProfileDetailDto {
  profileId?: number;
  profileCode?: string;
  fullName?: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  isVerified?: boolean;
  profileCompletionPercent?: number;
  lastActiveAt?: string;
  photos?: ProfilePhotoDto[];
  personalDetails?: PersonalDetailsViewDto;
  career?: CareerDetailsViewDto;
  familyInfo?: FamilyDetailsDto;
  relativeSurnames?: string[];
  partnerPreference?: PartnerPreferenceDto;
  horoscope?: ProfileHoroscopeDetailDto;
  contact?: ContactDetailsDto;
  phoneNumbers?: PhoneNumberDto[];
  isContactUnlocked?: boolean;
  interests?: string[];
  preferredCities?: string[];
  expectedCasteIds?: number[];
  expectedEducationIds?: number[];
  expectedOccupationIds?: number[];
}

export interface ProfileListItemDto {
  profileId?: number;
  profileCode?: string;
  fullName?: string;
  age?: number;
  locationText?: string;
  occupationText?: string;
  genderId?: number;
  maritalStatusId?: number;
  religionId?: number;
  casteId?: number;
  subCasteId?: number;
  stateId?: number;
  districtId?: number;
  manglik?: boolean;
  educationId?: number;
  occupationId?: number;
  workingCity?: string;
  incomeAmount?: number;
  thumbnailUrl?: string;
  isVerified?: boolean;
  isPremiumTenant?: boolean;
  publicDisplayName?: string;
  surname?: string;
  createdAt?: Date;
  dobDay?: number;
  dobMonth?: string;
  dobYear?: number;
  heightFt?: number;
  heightIn?: number;
  nativeDistrictName?: string;
  educationName?: string;
  occupationName?: string;
  occupationDetails?: string;
  incomePeriodName?: string;
  workingCountryName?: string;
}

export interface ProfileListItemDtoPagedResult {
  items?: ProfileListItemDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

// ─── Tenant DTOs ──────────────────────────────────────────────────────────────

export interface TenantDto {
  createdAt?: string;
  updatedAt?: string;
  tenantId?: number;
  tenantName?: string;
  domainName?: string;
  trialEndDate?: string;
  isActive?: boolean;
  userCount?: number;
}

export interface TenantResolveResponse {
  resolved: boolean;
  host: string;
  path: string;
  query: string | null;
  tenantId: number;
  tenantCode: string;
  domain: string;
}

// ─── Chat DTOs ────────────────────────────────────────────────────────────────

export enum ConversationStatus {
  Active = 0,
  Archived = 1,
  Deleted = 2,
  Blocked = 3,
}

export enum ConversationType {
  Direct = 0,
  Group = 1,
}

export enum MessageStatus {
  Sent = 0,
  Delivered = 1,
  Read = 2,
  Edited = 3,
  Deleted = 4,
}

export enum MessageType {
  Text = 0,
  Image = 1,
  Video = 2,
  Audio = 3,
  File = 4,
  System = 5,
  Location = 6,
}

export interface ChatAttachmentDto {
  attachmentId?: string;
  messageId?: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  fileUrl?: string;
}

export interface ChatMessageDto {
  id?: string;
  conversationId?: string;
  senderProfileId?: string;
  senderUserId?: string;
  tenantId?: string;
  content?: string;
  type?: MessageType;
  status?: MessageStatus;
  sentDate?: string;
  deliveredDate?: string;
  readDate?: string;
  editedDate?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedDate?: string;
  deletedByUserId?: string;
  replyToMessageId?: string;
  metadata?: string;
  isEncrypted?: boolean;
  createdAt?: string;
  replyToMessage?: ChatMessageDto;
  attachments?: ChatAttachmentDto[];
  readStatuses?: MessageReadStatusDto[];
  senderName?: string;
  senderPhotoUrl?: string;
}

export interface ChatParticipantDto {}

export interface MessageReadStatusDto {}

export interface ChatConversationDto {
  id?: string;
  profileId1?: string;
  profileId2?: string;
  userId1?: string;
  userId2?: string;
  tenantId?: string;
  conversationName?: string;
  type?: ConversationType;
  status?: ConversationStatus;
  lastMessageDate?: string;
  lastMessageId?: string;
  lastMessagePreview?: string;
  isArchived?: boolean;
  isBlocked?: boolean;
  blockedByUserId?: string;
  blockedDate?: string;
  blockReason?: string;
  totalMessagesCount?: number;
  unreadMessagesCount1?: number;
  unreadMessagesCount2?: number;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: ChatMessageDto;
  participants?: ChatParticipantDto[];
}

// ─── Subscription DTOs ────────────────────────────────────────────────────────

export interface PlanFeatureValueDto {
  code?: string;
  name?: string;
  category?: string;
  dataType?: string;
  value?: string;
}

export interface SubscriptionPlanDto {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  displayOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: PlanFeatureValueDto[];
}

export interface SubscriptionFeatureDto {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  dataType?: string;
  defaultValue?: string;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionPlanRequest {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  displayOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

export interface UpdateSubscriptionPlanRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  displayOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

export interface FeatureValueRequest {
  featureCode?: string;
  value?: string;
}

export interface SubscriptionStatusDto {
  isActive?: boolean;
  isExpired?: boolean;
  planName?: string;
  expiresAt?: string;
  isTrial?: boolean;
}

// ─── Notification DTOs ──────────────────────────────────────────────────────

export interface NotificationDto {
  notificationId?: number;
  title?: string;
  body?: string;
  summary?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  priority?: string;
  isRead?: boolean;
  readAt?: string;
  referenceType?: string;
  referenceId?: number;
  typeName?: string;
  typeCode?: string;
  categoryName?: string;
  categoryCode?: string;
  createdAt?: string;
}

export interface NotificationListResponse {
  notifications?: NotificationDto[];
  unreadCount?: number;
  page?: number;
  pageSize?: number;
}

export interface NotificationDetailResponse {
  notificationId?: number;
  title?: string;
  body?: string;
  summary?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  priority?: string;
  isRead?: boolean;
  readAt?: string;
  referenceType?: string;
  referenceId?: number;
  metadata?: string;
  typeName?: string;
  typeCode?: string;
  categoryName?: string;
  categoryCode?: string;
  createdAt?: string;
}

export interface SendNotificationRequestDto {
  userId?: number;
  typeCode?: string;
  title?: string;
  body?: string;
  summary?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  referenceType?: string;
  referenceId?: number;
  metadata?: string;
}

// ─── Billing DTOs ─────────────────────────────────────────────────────────

export interface PaymentTransactionDto {
  paymentId?: number;
  subscriptionId?: number;
  tenantId?: number;
  userId?: number;
  amount?: number;
  currency?: string;
  status?: string;
  paymentGateway?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutRequestDto {
  planId?: number;
}

export interface CheckoutResponseDto {
  success?: boolean;
  subscriptionId?: number;
  paymentId?: string;
  planName?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
}

// ─── Geo DTOs ─────────────────────────────────────────────────────────────────

export interface GeoCountryDto {
  countryId?: number;
  code?: string;
  name?: string;
  nameMr?: string;
}

export interface GeoStateDto {
  stateId?: number;
  countryId?: number;
  code?: string;
  name?: string;
  nameMr?: string;
}

export interface GeoDistrictDto {
  districtId?: number;
  stateId?: number;
  name?: string;
  nameMr?: string;
}

export interface GeoTalukaDto {
  talukaId?: number;
  districtId?: number;
  name?: string;
  nameMr?: string;
}
