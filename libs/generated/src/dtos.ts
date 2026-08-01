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
  roles?: string[];
  isTenantAdmin?: boolean;
}

export interface CreatedUserResponseDto {
  id?: number;
  email?: string;
}

export interface UserDirectPermissionDto {
  permissionId?: number;
  permissionCode?: string;
  displayName?: string;
}

export interface UserEffectivePermissionsDto {
  direct?: UserDirectPermissionDto[];
  fromRoles?: UserDirectPermissionDto[];
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
  userId?: number;
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
  maritalStatusName?: string;
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
  religionName?: string;
  casteName?: string;
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
  tenantId?: number;
  tenantCode?: string;
  name?: string;
  displayName?: string;
  domain?: string;
  trialEndDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  name?: string | null;
  displayName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
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
  attachmentId?: number;
  messageId?: number;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  fileUrl?: string;
}

export interface ChatMessageDto {
  messageId?: number;
  conversationId?: number;
  senderProfileId?: number;
  senderUserId?: number;
  tenantId?: number;
  content?: string;
  type?: string;
  status?: string;
  sentDate?: string;
  deliveredDate?: string;
  readDate?: string;
  editedDate?: string;
  isEdited?: boolean;
  deletedDate?: string;
  deletedByUserId?: number;
  replyToMessageId?: number;
  metadata?: string;
  isEncrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  replyToMessage?: ChatMessageDto;
  attachments?: ChatAttachmentDto[];
  readStatuses?: MessageReadStatusDto[];
  senderName?: string;
  senderPhotoUrl?: string;
}

export interface ChatParticipantDto {
  participantId?: number;
  conversationId?: number;
  profileId?: number;
  userId?: number;
  tenantId?: number;
  role?: string;
  status?: string;
  joinedDate?: string;
  leftDate?: string;
  lastSeenDate?: string;
  isOnline?: boolean;
  receiveNotifications?: boolean;
  isTyping?: boolean;
  typingStarted?: string;
  displayName?: string;
  profilePhotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageReadStatusDto {
  readStatusId?: number;
  messageId?: number;
  conversationId?: number;
  profileId?: number;
  userId?: number;
  tenantId?: number;
  isRead?: boolean;
  readDate?: string;
  isDelivered?: boolean;
  deliveredDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatConversationDto {
  conversationId?: number;
  profileId1?: number;
  profileId2?: number;
  userId1?: number;
  userId2?: number;
  tenantId?: number;
  conversationName?: string;
  type?: string;
  status?: string;
  lastMessageDate?: string;
  lastMessageId?: number;
  lastMessagePreview?: string;
  isArchived?: boolean;
  isBlocked?: boolean;
  blockedByUserId?: number;
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

export interface SendMessageRequest {
  conversationId?: number;
  senderProfileId?: number;
  senderUserId?: number;
  tenantId?: number;
  content?: string;
  type?: string;
  replyToMessageId?: number;
  metadata?: string;
}

export interface CreateConversationRequest {
  profileId1?: number;
  profileId2?: number;
  userId1?: number;
  userId2?: number;
  tenantId?: number;
  conversationName?: string;
  type?: string;
  initialMessage?: string;
}

export interface UpdateMessageRequest {
  content?: string;
}

export interface MarkMessagesAsReadRequest {
  conversationId?: number;
  profileId?: number;
  userId?: number;
  messageIds?: number[];
}

export interface BlockUserRequest {
  blockedUserId?: number;
  blockedProfileId?: number;
  reason?: string;
  description?: string;
}

export interface AddChatParticipantRequest {
  conversationId?: number;
  profileId?: number;
  userId?: number;
  displayName?: string;
  profilePhotoUrl?: string;
}

export interface UpdateChatParticipantRequest {
  displayName?: string;
  profilePhotoUrl?: string;
  receiveNotifications?: boolean;
  status?: string;
}

export interface BlockedChatUserDto {
  blockId?: number;
  blockerUserId?: number;
  blockerProfileId?: number;
  blockedUserId?: number;
  blockedProfileId?: number;
  tenantId?: number;
  reason?: string;
  description?: string;
  blockedDate?: string;
  isActive?: boolean;
  unblockedDate?: string;
  unblockReason?: string;
  createdAt?: string;
  updatedAt?: string;
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
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
  features?: PlanFeatureValueDto[];
  tenantFeatures?: TenantFeatureValueDto[];
}

export interface TenantFeatureValueDto {
  featureDefinitionId?: number;
  featureCode?: string;
  displayName?: string;
  description?: string;
  featureGroup?: string;
  hasLimit?: boolean;
  limitType?: string;
  value?: string;
}

export interface SubscriptionFeatureDto {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  dataType?: string;
  defaultValue?: string;
  tenantId?: number;
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
  tenantId?: number;
  features?: FeatureValueRequest[];
  tenantFeatures?: FeatureValueRequest[];
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
  tenantFeatures?: FeatureValueRequest[];
}

export interface FeatureValueRequest {
  featureCode?: string;
  value?: string;
}

export interface CreateSubscriptionFeatureRequest {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  dataType?: string;
  defaultValue?: string;
  tenantId?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionFeatureRequest {
  name?: string;
  description?: string;
  category?: string;
  dataType?: string;
  defaultValue?: string;
  isActive?: boolean;
}

export interface SubscriptionStatusDto {
  isActive?: boolean;
  isExpired?: boolean;
  planName?: string;
  startDate?: string;
  expiresAt?: string;
  isTrial?: boolean;
  effectiveFeatures?: PlanFeatureValueDto[];
}

// ─── Tenant Subscription DTOs ──────────────────────────────────────────────────

export interface TenantSubscriptionDto {
  subscriptionId: number;
  tenantId: number;
  subscriptionPlanId: number;
  planName?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantSubscriptionRequest {
  tenantId: number;
  subscriptionPlanId: number;
  startDate: string;
  endDate: string;
}

export interface UpdateTenantSubscriptionRequest {
  endDate?: string;
  isActive?: boolean;
}

// ─── User Subscription Plan DTOs ──────────────────────────────────────────────

export interface UserSubscriptionPlanDto {
  id?: number;
  tenantId?: number;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: PlanFeatureValueDto[];
}

export interface CreateUserSubscriptionPlanRequest {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

export interface UpdateUserSubscriptionPlanRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
  currency?: string;
  isActive?: boolean;
  features?: FeatureValueRequest[];
}

// ─── Match DTOs ───────────────────────────────────────────────────────────────

export enum MatchType {
  SystemGenerated = 1,
  Mutual = 2,
  PremiumBoost = 3,
  AiRecommended = 4,
}

export enum MatchStatus {
  Pending = 1,
  Viewed = 2,
  Interested = 3,
  Accepted = 4,
  Declined = 5,
  Expired = 6,
}

export enum InterestRequestStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Withdrawn = 'Withdrawn',
}

export enum ScoreDimension {
  Age = 1,
  Height = 2,
  Religion = 3,
  Caste = 4,
  Education = 5,
  Occupation = 6,
  Income = 7,
  Location = 8,
  Lifestyle = 9,
  Family = 10,
  Horoscope = 11,
  Language = 12,
  Behavior = 13,
  AiCompatibility = 14,
}

export enum RecommendationReason {
  HighCompatibility = 1,
  SimilarProfile = 2,
  RecentlyJoined = 3,
  Trending = 4,
  PremiumBoost = 5,
  AiRecommended = 6,
  CollaborativeFilter = 7,
}

export interface MatchEntityDto {
  matchId?: number;
  profileIdA?: number;
  profileIdB?: number;
  matchType?: MatchType;
  matchStatus?: MatchStatus;
  compatibilityScore?: number;
  matchingFactors?: string;
  expiresAt?: string;
  generatedAt?: string;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchScoreDto {
  matchScoreId?: number;
  matchId?: number;
  scoreDimension?: ScoreDimension;
  scoreWeight?: number;
  rawScore?: number;
  weightedScore?: number;
  scoreExplanation?: string;
  algorithmVersion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMatchRequest {
  profileIdA?: number;
  profileIdB?: number;
  matchType?: MatchType;
  compatibilityScore?: number;
}

export interface UpdateMatchStatusRequest {
  status?: MatchStatus;
}

export interface InterestRequestDto {
  interestRequestId?: number;
  requesterProfileId?: number;
  requesterName?: string;
  targetProfileId?: number;
  targetName?: string;
  status?: InterestRequestStatus;
  message?: string;
  respondedAt?: string;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SendInterestRequestDto {
  targetProfileId?: number;
  message?: string;
}

export interface RespondToInterestRequest {
  status?: InterestRequestStatus;
}

export interface CompatibilityRuleDto {
  ruleId?: number;
  ruleName?: string;
  scoreDimension?: ScoreDimension;
  defaultWeight?: number;
  tenantWeightOverride?: number;
  isActive?: boolean;
  priorityRank?: number;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompatibilityRuleRequest {
  ruleName?: string;
  scoreDimension?: ScoreDimension;
  defaultWeight?: number;
  priorityRank?: number;
}

export interface UpdateRuleWeightRequest {
  weight?: number;
}

export interface ProfileShortlistDto {
  shortlistId?: number;
  profileId?: number;
  targetProfileId?: number;
  shortlistName?: string;
  notes?: string;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddShortlistRequest {
  profileId?: number;
  targetProfileId?: number;
  shortlistName?: string;
  notes?: string;
}

export interface ProfileViewDto {
  viewId?: number;
  viewerProfileId?: number;
  viewedProfileId?: number;
  viewedAt?: string;
}

export interface RecordProfileViewRequest {
  viewerProfileId?: number;
  viewedProfileId?: number;
}

export interface ProfileStatsDto {
  totalProfiles?: number;
  brideCount?: number;
  groomCount?: number;
  unmarriedCount?: number;
  divorcedCount?: number;
}

export interface RecommendationDto {
  recommendationId?: number;
  profileId?: number;
  tenantId?: number;
  recommendedProfileId?: number;
  score?: number;
  reasonCode?: RecommendationReason;
  reasonDescription?: string;
  algorithmVersion?: string;
  isViewed?: boolean;
  isClicked?: boolean;
  generatedAt?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecommendationRequest {
  profileId?: number;
  recommendedProfileId?: number;
  score?: number;
  reasonCode?: RecommendationReason;
  algorithmVersion?: string;
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
  paymentTransactionId?: number;
  userId?: number;
  userSubscriptionId?: number;
  invoiceId?: number;
  amount?: number;
  currencyCode?: string;
  paymentGatewayId?: number;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  status?: string;
  idempotencyKey?: string;
  description?: string;
  succeededAt?: string;
  failedAt?: string;
  failureReason?: string;
  failureCode?: string;
  refundedAmount?: number;
  metadataJson?: string;
  tenantId?: number;
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
