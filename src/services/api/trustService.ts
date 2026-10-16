/**
 * ============================================================================
 * [TRUST & MODERATION SERVICE INTERFACE — FASTAPI /moderation CONTRACT]
 * ============================================================================
 */

import { UserReport, BlockedUser } from '../../types';
import { ApiResponse, CreateReportDto, BlockUserDto } from './types';

export interface ITrustService {
  submitReport(data: CreateReportDto): Promise<ApiResponse<UserReport>>;
  blockUser(data: BlockUserDto): Promise<ApiResponse<{ blocked: boolean }>>;
  unblockUser(userId: string): Promise<ApiResponse<{ unblocked: boolean }>>;
  getBlockedUsers(): Promise<ApiResponse<BlockedUser[]>>;
}
