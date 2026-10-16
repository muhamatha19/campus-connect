import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PickDropRequest, PickDropStatus, ContactPreference } from '../types';
import { INITIAL_PICKDROP_REQUESTS } from '../data/demoData';
import { useAuth } from './AuthContext';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — MOCK CAMPUS PICK & DROP DATA LAYER]
 * ============================================================================
 * Manages peer courier & errand requests with local AsyncStorage persistence.
 *
 * ARCHITECTURAL NOTES:
 * 1. Seeded demo requests and user-created deliveries are stored offline.
 * 2. Simulates status transitions across 6 delivery checkpoints:
 *    Requested -> Accepted -> Pickup in progress -> Picked up -> On the way -> Delivered
 *    (or Cancelled).
 * 3. Does not use paid map APIs, fake live GPS animations, or real payments.
 * ============================================================================
 */

export interface CreatePickDropInput {
  itemName: string;
  itemDescription: string;
  pickupLocation: string;
  dropoffLocation: string;
  preferredDateTime: string;
  reward?: number;
  additionalInstructions?: string;
  contactPreference: ContactPreference;
}

export type PickDropTab = 'available' | 'my-requests' | 'my-runs' | 'all';

interface PickDropContextType {
  requests: PickDropRequest[];
  activeFilterTab: PickDropTab;
  searchQuery: string;
  statusFilter: 'All' | PickDropStatus;
  isLoading: boolean;
  createRequest: (input: CreatePickDropInput) => Promise<{ success: boolean; request?: PickDropRequest; error?: string }>;
  cancelRequest: (requestId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  acceptDelivery: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  advanceStatus: (requestId: string) => Promise<{ success: boolean; newStatus?: PickDropStatus; error?: string }>;
  setActiveFilterTab: (tab: PickDropTab) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'All' | PickDropStatus) => void;
  resetToDemoRequests: () => Promise<void>;
  filteredRequests: PickDropRequest[];
  availableCount: number;
  myRequestsCount: number;
  myRunsCount: number;
}

const STORAGE_KEY_PICKDROP = '@campus_connect_pickdrop_v2';

const PickDropContext = createContext<PickDropContextType | undefined>(undefined);

export const PickDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<PickDropRequest[]>(INITIAL_PICKDROP_REQUESTS);
  const [activeFilterTab, setActiveFilterTab] = useState<PickDropTab>('available');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | PickDropStatus>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage
  useEffect(() => {
    const loadStoredRequests = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_PICKDROP);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed);
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_PICKDROP, JSON.stringify(INITIAL_PICKDROP_REQUESTS));
        }
      } catch (e) {
        console.warn('[PickDropContext] Error loading cached pick & drop requests', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredRequests();
  }, []);

  const persistRequests = async (newRequests: PickDropRequest[]) => {
    try {
      setRequests(newRequests);
      await AsyncStorage.setItem(STORAGE_KEY_PICKDROP, JSON.stringify(newRequests));
    } catch (e) {
      console.warn('[PickDropContext] Error saving pick & drop requests to storage', e);
    }
  };

  const currentUserId = user?.id || 'usr_demo_101';
  const currentUserName = user?.name ? `${user.name} (You)` : 'Alex Chen (You)';
  const currentUserHostel = user?.hostel || 'Hostel 4, Room 312';

  const createRequest = async (
    input: CreatePickDropInput
  ): Promise<{ success: boolean; request?: PickDropRequest; error?: string }> => {
    if (!input.itemName.trim()) {
      return { success: false, error: 'Item name is required.' };
    }
    if (!input.itemDescription.trim()) {
      return { success: false, error: 'Item description or instructions are required.' };
    }
    if (!input.pickupLocation.trim()) {
      return { success: false, error: 'Pick-up location is required.' };
    }
    if (!input.dropoffLocation.trim()) {
      return { success: false, error: 'Drop-off destination is required.' };
    }
    if (!input.preferredDateTime.trim()) {
      return { success: false, error: 'Preferred date and time is required.' };
    }

    const numReward = input.reward !== undefined ? Number(input.reward) : 0;
    if (isNaN(numReward) || numReward < 0) {
      return { success: false, error: 'Reward cannot be negative.' };
    }

    const newRequest: PickDropRequest = {
      id: `pd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      itemName: input.itemName.trim(),
      itemDescription: input.itemDescription.trim(),
      pickupLocation: input.pickupLocation.trim(),
      dropoffLocation: input.dropoffLocation.trim(),
      preferredDateTime: input.preferredDateTime.trim(),
      reward: numReward > 0 ? numReward : undefined,
      additionalInstructions: input.additionalInstructions?.trim() || undefined,
      contactPreference: input.contactPreference,
      status: 'Requested',
      requesterId: currentUserId,
      requesterName: currentUserName,
      requesterHostel: currentUserHostel,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      estimatedTransitTime: '8-12 mins campus walk',
    };

    const updated = [newRequest, ...requests];
    await persistRequests(updated);

    return { success: true, request: newRequest };
  };

  const cancelRequest = async (
    requestId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = requests.find((r) => r.id === requestId);
    if (!existing) {
      return { success: false, error: 'Request not found.' };
    }

    if (existing.status === 'Delivered') {
      return { success: false, error: 'Cannot cancel a delivery that has already been completed.' };
    }

    if (existing.status === 'Cancelled') {
      return { success: false, error: 'This request is already cancelled.' };
    }

    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Cancelled' as PickDropStatus,
          additionalInstructions: reason
            ? `${req.additionalInstructions || ''} [Cancelled: ${reason}]`.trim()
            : req.additionalInstructions,
        };
      }
      return req;
    });

    await persistRequests(updated);
    return { success: true };
  };

  const acceptDelivery = async (
    requestId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const existing = requests.find((r) => r.id === requestId);
    if (!existing) {
      return { success: false, error: 'Request not found.' };
    }

    if (existing.status !== 'Requested') {
      return { success: false, error: `This request is already ${existing.status.toLowerCase()}.` };
    }

    if (existing.requesterId === currentUserId) {
      return { success: false, error: 'You cannot accept your own delivery request.' };
    }

    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Accepted' as PickDropStatus,
          runnerId: currentUserId,
          runnerName: currentUserName,
          runnerRating: 4.9,
        };
      }
      return req;
    });

    await persistRequests(updated);
    return { success: true };
  };

  const advanceStatus = async (
    requestId: string
  ): Promise<{ success: boolean; newStatus?: PickDropStatus; error?: string }> => {
    const existing = requests.find((r) => r.id === requestId);
    if (!existing) {
      return { success: false, error: 'Request not found.' };
    }

    if (existing.status === 'Delivered' || existing.status === 'Cancelled') {
      return { success: false, error: `Delivery is already ${existing.status.toLowerCase()}.` };
    }

    // Progression:
    // Requested -> Accepted -> Pickup in progress -> Picked up -> On the way -> Delivered
    let nextStatus: PickDropStatus;
    switch (existing.status) {
      case 'Requested':
        nextStatus = 'Accepted';
        break;
      case 'Accepted':
        nextStatus = 'Pickup in progress';
        break;
      case 'Pickup in progress':
        nextStatus = 'Picked up';
        break;
      case 'Picked up':
        nextStatus = 'On the way';
        break;
      case 'On the way':
        nextStatus = 'Delivered';
        break;
      default:
        nextStatus = 'Delivered';
    }

    const updated = requests.map((req) => {
      if (req.id === requestId) {
        const runnerAssigned = req.runnerId
          ? req
          : {
              ...req,
              runnerId: 'usr_other_peer',
              runnerName: 'Campus Peer Runner',
              runnerRating: 4.8,
            };
        return {
          ...runnerAssigned,
          status: nextStatus,
        };
      }
      return req;
    });

    await persistRequests(updated);
    return { success: true, newStatus: nextStatus };
  };

  const resetToDemoRequests = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PICKDROP, JSON.stringify(INITIAL_PICKDROP_REQUESTS));
      setRequests(INITIAL_PICKDROP_REQUESTS);
      setActiveFilterTab('available');
      setSearchQuery('');
      setStatusFilter('All');
    } catch (e) {
      console.warn('[PickDropContext] Error resetting demo data', e);
    }
  };

  // Tab filtering logic
  const filteredRequests = requests.filter((req) => {
    // 1. Tab segment
    if (activeFilterTab === 'available') {
      if (req.status !== 'Requested') return false;
      if (req.requesterId === currentUserId) return false;
    } else if (activeFilterTab === 'my-requests') {
      if (req.requesterId !== currentUserId) return false;
    } else if (activeFilterTab === 'my-runs') {
      if (req.runnerId !== currentUserId) return false;
    }

    // 2. Status Chip filter
    if (statusFilter !== 'All' && req.status !== statusFilter) {
      return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = req.itemName.toLowerCase().includes(q);
      const matchDesc = req.itemDescription.toLowerCase().includes(q);
      const matchPickup = req.pickupLocation.toLowerCase().includes(q);
      const matchDropoff = req.dropoffLocation.toLowerCase().includes(q);
      const matchRequester = req.requesterName.toLowerCase().includes(q);
      const matchRunner = req.runnerName?.toLowerCase().includes(q) || false;
      if (!matchItem && !matchDesc && !matchPickup && !matchDropoff && !matchRequester && !matchRunner) {
        return false;
      }
    }

    return true;
  });

  const availableCount = requests.filter(
    (r) => r.status === 'Requested' && r.requesterId !== currentUserId
  ).length;

  const myRequestsCount = requests.filter((r) => r.requesterId === currentUserId).length;

  const myRunsCount = requests.filter((r) => r.runnerId === currentUserId).length;

  return (
    <PickDropContext.Provider
      value={{
        requests,
        activeFilterTab,
        searchQuery,
        statusFilter,
        isLoading,
        createRequest,
        cancelRequest,
        acceptDelivery,
        advanceStatus,
        setActiveFilterTab,
        setSearchQuery,
        setStatusFilter,
        resetToDemoRequests,
        filteredRequests,
        availableCount,
        myRequestsCount,
        myRunsCount,
      }}
    >
      {children}
    </PickDropContext.Provider>
  );
};

export const usePickDrop = () => {
  const context = useContext(PickDropContext);
  if (!context) {
    throw new Error('usePickDrop must be used within a PickDropProvider');
  }
  return context;
};
