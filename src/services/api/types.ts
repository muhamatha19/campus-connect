/**
 * ============================================================================
 * [BACKEND SERVICE CONTRACTS — FASTAPI & MONGODB READINESS]
 * ============================================================================
 * These TypeScript interfaces define the Data Transfer Objects (DTOs) and
 * response models for future integration with a FastAPI (Python) backend and
 * MongoDB database.
 * ============================================================================
 */

import {
  MarketplaceCategory,
  ItemCondition,
  ContactPreference,
  TaskCategory,
  TaskStatus,
  PickDropStatus,
  ReportReason,
  VerificationStatus,
} from '../../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Auth & Student Profile DTOs (FastAPI: /api/v1/auth & /api/v1/users)
// ----------------------------------------------------------------------------

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  name: string;
  email: string;
  password: string;
  college: string;
  department: string;
  studyYear: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // 'Bearer'
  expiresIn: number;
}

export interface UserProfileResponseDto {
  id: string; // MongoDB ObjectId as string
  name: string;
  email: string;
  college: string;
  department: string;
  studyYear: string;
  hostel?: string;
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationMethod?: 'college_email' | 'id_card';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequestDto {
  name?: string;
  college?: string;
  department?: string;
  studyYear?: string;
  hostel?: string;
  bio?: string;
  avatar?: string;
}

export interface VerifyOtpRequestDto {
  otp: string;
}

// ----------------------------------------------------------------------------
// Marketplace DTOs (FastAPI: /api/v1/marketplace)
// ----------------------------------------------------------------------------

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: MarketplaceCategory;
  condition: ItemCondition;
  contactPreference: ContactPreference;
  campusLocation?: string;
  imageUri?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}

export interface ProductFiltersDto {
  category?: MarketplaceCategory;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ----------------------------------------------------------------------------
// Tasks DTOs (FastAPI: /api/v1/tasks)
// ----------------------------------------------------------------------------

export interface CreateTaskDto {
  title: string;
  description: string;
  reward?: number;
  category: TaskCategory;
  pickupLocation?: string;
  destinationLocation: string;
  deadline: string;
  contactPreference: ContactPreference;
  urgency?: 'normal' | 'high';
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

// ----------------------------------------------------------------------------
// Pick & Drop DTOs (FastAPI: /api/v1/pickdrop)
// ----------------------------------------------------------------------------

export interface CreatePickDropDto {
  itemName: string;
  itemDescription: string;
  pickupLocation: string;
  dropoffLocation: string;
  preferredDateTime: string;
  reward?: number;
  additionalInstructions?: string;
  contactPreference: ContactPreference;
}

export interface UpdatePickDropStatusDto {
  status: PickDropStatus;
}

// ----------------------------------------------------------------------------
// Chat & Messages DTOs (FastAPI: /api/v1/chat)
// ----------------------------------------------------------------------------

export interface SendMessageDto {
  conversationId: string;
  text: string;
}

export interface CreateConversationDto {
  peerId: string;
  topicType: string;
  topicTitle: string;
  topicReferenceId?: string;
  initialMessage?: string;
}

// ----------------------------------------------------------------------------
// Trust & Moderation DTOs (FastAPI: /api/v1/moderation)
// ----------------------------------------------------------------------------

export interface CreateReportDto {
  targetId: string;
  targetType: 'user' | 'listing' | 'task' | 'pickdrop';
  targetTitle: string;
  reason: ReportReason;
  notes?: string;
}

export interface BlockUserDto {
  targetUserId: string;
}
