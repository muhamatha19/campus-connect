/**
 * ============================================================================
 * [PICK & DROP SERVICE INTERFACE — FASTAPI /pickdrop CONTRACT]
 * ============================================================================
 */

import { PickDropRequest, PickDropStatus } from '../../types';
import { ApiResponse, CreatePickDropDto, UpdatePickDropStatusDto } from './types';

export interface IPickDropService {
  getRequests(filters?: { status?: PickDropStatus; query?: string }): Promise<ApiResponse<PickDropRequest[]>>;
  getRequestById(id: string): Promise<ApiResponse<PickDropRequest>>;
  createRequest(data: CreatePickDropDto): Promise<ApiResponse<PickDropRequest>>;
  acceptDelivery(requestId: string): Promise<ApiResponse<PickDropRequest>>;
  advanceStatus(requestId: string, data: UpdatePickDropStatusDto): Promise<ApiResponse<PickDropRequest>>;
  cancelRequest(requestId: string, reason?: string): Promise<ApiResponse<{ cancelled: boolean }>>;
  getMyRequests(): Promise<ApiResponse<PickDropRequest[]>>;
  getMyRuns(): Promise<ApiResponse<PickDropRequest[]>>;
}
