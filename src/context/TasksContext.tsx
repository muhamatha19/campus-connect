import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, TaskCategory, TaskStatus, ContactPreference } from '../types';
import { INITIAL_TASKS } from '../data/demoData';
import { useAuth } from './AuthContext';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — MOCK CAMPUS TASKS DATA LAYER]
 * ============================================================================
 * This context manages student peer tasks and errand requests with local persistence.
 *
 * ARCHITECTURAL NOTES:
 * 1. Tasks are persisted offline via AsyncStorage.
 * 2. Simulates task assignment, acceptance locking, and status transitions:
 *    Open -> Accepted -> In Progress -> Completed (or Cancelled).
 * 3. Does not process real financial payments or dispatch real backend jobs.
 * ============================================================================
 */

export interface CreateTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  pickupLocation?: string;
  destinationLocation: string;
  reward?: number;
  deadline: string;
  contactPreference: ContactPreference;
  urgency?: 'high' | 'normal';
}

interface TasksContextType {
  tasks: TaskItem[];
  activeFilterTab: 'available' | 'my-posted' | 'my-accepted';
  selectedCategory: TaskCategory;
  searchQuery: string;
  statusFilter: 'All' | TaskStatus;
  isLoading: boolean;
  createTask: (input: CreateTaskInput) => Promise<{ success: boolean; task?: TaskItem; error?: string }>;
  acceptTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; error?: string }>;
  cancelTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  completeTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  setActiveFilterTab: (tab: 'available' | 'my-posted' | 'my-accepted') => void;
  setSelectedCategory: (cat: TaskCategory) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'All' | TaskStatus) => void;
  resetToDemoTasks: () => Promise<void>;
  filteredTasks: TaskItem[];
  myPostedCount: number;
  myAcceptedCount: number;
  availableCount: number;
}

const STORAGE_KEY_TASKS = '@campus_connect_tasks_v2';

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeFilterTab, setActiveFilterTab] = useState<'available' | 'my-posted' | 'my-accepted'>('available');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage
  useEffect(() => {
    const loadStoredTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_TASKS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
        }
      } catch (e) {
        console.warn('[TasksContext] Error loading cached tasks', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredTasks();
  }, []);

  const persistTasks = async (newTasks: TaskItem[]) => {
    try {
      setTasks(newTasks);
      await AsyncStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
    } catch (e) {
      console.warn('[TasksContext] Error saving tasks to storage', e);
    }
  };

  const currentUserId = user?.id || 'usr_demo_101';
  const currentUserName = user?.name ? `${user.name} (You)` : 'You (Current Student)';

  const createTask = async (
    input: CreateTaskInput
  ): Promise<{ success: boolean; task?: TaskItem; error?: string }> => {
    if (!input.title.trim()) {
      return { success: false, error: 'Task title is required.' };
    }
    if (!input.description.trim()) {
      return { success: false, error: 'Task description is required.' };
    }
    if (!input.destinationLocation.trim()) {
      return { success: false, error: 'Destination or drop-off location is required.' };
    }
    if (!input.deadline.trim()) {
      return { success: false, error: 'Expected deadline or delivery time is required.' };
    }
    const numReward = input.reward !== undefined ? Number(input.reward) : 0;
    if (isNaN(numReward) || numReward < 0) {
      return { success: false, error: 'Reward cannot be negative.' };
    }

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      reward: Math.round(numReward),
      category: input.category,
      pickupLocation: input.pickupLocation?.trim() || undefined,
      destinationLocation: input.destinationLocation.trim(),
      deadline: input.deadline.trim(),
      contactPreference: input.contactPreference,
      requesterId: currentUserId,
      requesterName: currentUserName,
      requesterVerified: user?.isVerified || false,
      postedTime: 'Just now',
      createdAt: new Date().toISOString(),
      status: 'Open',
      urgency: input.urgency || 'normal',
    };

    const updated = [newTask, ...tasks];
    await persistTasks(updated);

    return { success: true, task: newTask };
  };

  const acceptTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return { success: false, error: 'Task not found.' };
    }

    const task = tasks[index];

    // Prevent accepting own task
    if (task.requesterId === currentUserId) {
      return { success: false, error: 'You cannot accept a task you posted yourself.' };
    }

    // Prevent accepting already accepted or closed task
    if (task.status !== 'Open') {
      return { success: false, error: `This task is already ${task.status.toLowerCase()}.` };
    }

    // Prevent duplicate acceptance by the same user
    if (task.acceptedById === currentUserId) {
      return { success: false, error: 'You have already accepted this task.' };
    }

    const updatedTask: TaskItem = {
      ...task,
      status: 'Accepted',
      acceptedById: currentUserId,
      acceptedByName: currentUserName,
      acceptedAt: new Date().toISOString(),
    };

    const updatedList = [...tasks];
    updatedList[index] = updatedTask;
    await persistTasks(updatedList);

    return { success: true };
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus
  ): Promise<{ success: boolean; error?: string }> => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return { success: false, error: 'Task not found.' };
    }

    const task = tasks[index];

    // Permission check: only requester or accepted helper can update status
    const isOwner = task.requesterId === currentUserId;
    const isAssignee = task.acceptedById === currentUserId;

    if (!isOwner && !isAssignee) {
      return { success: false, error: 'You do not have permission to modify this task status.' };
    }

    const updatedTask: TaskItem = {
      ...task,
      status: newStatus,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : task.completedAt,
    };

    const updatedList = [...tasks];
    updatedList[index] = updatedTask;
    await persistTasks(updatedList);

    return { success: true };
  };

  const cancelTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    return await updateTaskStatus(taskId, 'Cancelled');
  };

  const completeTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    return await updateTaskStatus(taskId, 'Completed');
  };

  const resetToDemoTasks = async () => {
    await persistTasks(INITIAL_TASKS as unknown as TaskItem[]);
  };

  // Filter tasks based on tabs, search, category, and status
  const filteredTasks = tasks.filter((task) => {
    // 1. Tab filter
    if (activeFilterTab === 'available') {
      if (task.status !== 'Open') return false;
      // Do not show user's own task under "available to take"
      if (task.requesterId === currentUserId) return false;
    } else if (activeFilterTab === 'my-posted') {
      if (task.requesterId !== currentUserId) return false;
    } else if (activeFilterTab === 'my-accepted') {
      if (task.acceptedById !== currentUserId) return false;
    }

    // 2. Category filter
    if (selectedCategory !== 'All' && task.category !== selectedCategory) {
      return false;
    }

    // 3. Status filter (when viewing my-posted or my-accepted)
    if (activeFilterTab !== 'available' && statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }

    // 4. Search query
    const query = searchQuery.trim().toLowerCase();
    if (query !== '') {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      const matchPickup = task.pickupLocation?.toLowerCase().includes(query);
      const matchDest = task.destinationLocation.toLowerCase().includes(query);
      const matchRequester = task.requesterName.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchPickup && !matchDest && !matchRequester) {
        return false;
      }
    }

    return true;
  });

  const myPostedCount = tasks.filter((t) => t.requesterId === currentUserId).length;
  const myAcceptedCount = tasks.filter((t) => t.acceptedById === currentUserId).length;
  const availableCount = tasks.filter((t) => t.status === 'Open' && t.requesterId !== currentUserId).length;

  return (
    <TasksContext.Provider
      value={{
        tasks,
        activeFilterTab,
        selectedCategory,
        searchQuery,
        statusFilter,
        isLoading,
        createTask,
        acceptTask,
        updateTaskStatus,
        cancelTask,
        completeTask,
        setActiveFilterTab,
        setSelectedCategory,
        setSearchQuery,
        setStatusFilter,
        resetToDemoTasks,
        filteredTasks,
        myPostedCount,
        myAcceptedCount,
        availableCount,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
