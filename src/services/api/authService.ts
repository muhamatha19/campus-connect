/**
 * ============================================================================
 * [AUTH SERVICE INTERFACE — FASTAPI /auth & /users CONTRACT]
 * ============================================================================
 */

import {
  ApiResponse,
  LoginRequestDto,
  SignupRequestDto,
  AuthTokensDto,
  UserProfileResponseDto,
  UpdateProfileRequestDto,
  VerifyOtpRequestDto,
} from './types';

export interface IAuthService {
  login(credentials: LoginRequestDto): Promise<ApiResponse<{ user: UserProfileResponseDto; tokens: AuthTokensDto }>>;
  signup(data: SignupRequestDto): Promise<ApiResponse<{ user: UserProfileResponseDto; tokens?: AuthTokensDto }>>;
  getCurrentUser(): Promise<ApiResponse<UserProfileResponseDto>>;
  updateProfile(data: UpdateProfileRequestDto): Promise<ApiResponse<UserProfileResponseDto>>;
  verifyOtp(data: VerifyOtpRequestDto): Promise<ApiResponse<{ verified: boolean }>>;
  submitIdCard(documentName: string, fileUri?: string): Promise<ApiResponse<{ status: string }>>;
  requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>>;
  logout(): Promise<void>;
}
