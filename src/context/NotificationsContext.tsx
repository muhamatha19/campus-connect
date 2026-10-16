import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CampusNotification, NotificationCategory, IconName } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/demoData';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — CAMPUS NOTIFICATIONS DATA LAYER]
 * ============================================================================
 * Manages campus activity updates, errand alerts, and announcements offline.
 * ============================================================================
 */

export interface AddNotificationInput {
  title: string;
  description: string;
  category: NotificationCategory;
  icon: IconName;
  iconColor?: string;
  targetScreen?: any;
  targetParams?: Record<string, any>;
}

interface NotificationsContextType {
  notifications: CampusNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (input: AddNotificationInput) => Promise<void>;
  resetToDemoNotifications: () => Promise<void>;
}

const STORAGE_KEY_NOTIFS = '@campus_connect_notifications_v2';

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<CampusNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage
  useEffect(() => {
    const loadStoredNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_NOTIFS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
        }
      } catch (e) {
        console.warn('[NotificationsContext] Error loading cached notifications', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredNotifications();
  }, []);

  const persistNotifications = async (updated: CampusNotification[]) => {
    try {
      setNotifications(updated);
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[NotificationsContext] Error saving notifications to storage', e);
    }
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await persistNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    await persistNotifications(updated);
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    await persistNotifications(updated);
  };

  const addNotification = async (input: AddNotificationInput) => {
    const newNotif: CampusNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      isRead: false,
      icon: input.icon,
      iconColor: input.iconColor,
      targetScreen: input.targetScreen,
      targetParams: input.targetParams,
    };

    const updated = [newNotif, ...notifications];
    await persistNotifications(updated);
  };

  const resetToDemoNotifications = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    } catch (e) {
      console.warn('[NotificationsContext] Error resetting demo notifications', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        resetToDemoNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
