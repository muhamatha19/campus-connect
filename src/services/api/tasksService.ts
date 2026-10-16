/**
 * ============================================================================
 * [TASKS SERVICE INTERFACE — FASTAPI /tasks CONTRACT]
 * ============================================================================
 */

import { TaskItem, TaskCategory, TaskStatus } from '../../types';
import { ApiResponse, CreateTaskDto, UpdateTaskStatusDto } from './types';

export interface ITasksService {
  getTasks(filters?: { category?: TaskCategory; status?: TaskStatus; query?: string }): Promise<ApiResponse<TaskItem[]>>;
  getTaskById(id: string): Promise<ApiResponse<TaskItem>>;
  createTask(data: CreateTaskDto): Promise<ApiResponse<TaskItem>>;
  acceptTask(taskId: string): Promise<ApiResponse<TaskItem>>;
  updateTaskStatus(taskId: string, data: UpdateTaskStatusDto): Promise<ApiResponse<TaskItem>>;
  cancelTask(taskId: string): Promise<ApiResponse<{ cancelled: boolean }>>;
  getMyPostedTasks(): Promise<ApiResponse<TaskItem[]>>;
  getMyAcceptedTasks(): Promise<ApiResponse<TaskItem[]>>;
}
