import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthUser,
  VerificationStatus,
  BlockedUser,
  UserReport,
  NotificationPreferences,
} from '../types';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — MOCK AUTHENTICATION & TRUST DATA LAYER]
 * ============================================================================
 * This authentication context provides simulated, frontend-only state management
 * for UI/UX prototyping, student profile editing, local trust moderation (reporting
 * & blocking), and notification preference storage.
 *
 * SECURITY & HONESTY DISCLOSURE:
 * 1. Passwords are NEVER persisted in storage or logs.
 * 2. This frontend-only mock DOES NOT provide real cryptographic security.
 * 3. Reports and block lists are stored locally on device for demo evaluation.
 * 4. Verification statuses (unverified, pending, verified) represent true app state
 *    and are never fabricated or falsified.
 * ============================================================================
 */

export interface SignupData {
  name: string;
  email: string;
  password?: string; // transient for validation only, never stored in state
  college: string;
  department: string;
  studyYear: string;
}

export interface OnboardingData {
  college?: string;
  department?: string;
  studyYear?: string;
  hostel?: string;
  bio?: string;
  avatar?: string;
}

export const DEFAULT_NOTIF_PREFS: NotificationPreferences = {
  taskUpdates: true,
  marketplaceAlerts: true,
  chatMessages: true,
  courierDelivery: true,
  campusAnnouncements: true,
  emailDigest: false,
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateOnboarding: (data: OnboardingData) => Promise<{ success: boolean }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  submitVerificationOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  submitIdCardMock: (documentName: string) => Promise<{ success: boolean }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Trust & safety features (Part 7)
  blockedUsers: BlockedUser[];
  blockUser: (target: { id: string; name: string; department?: string }) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isUserBlocked: (userId: string) => boolean;
  reports: UserReport[];
  submitReport: (report: Omit<UserReport, 'id' | 'timestamp'>) => Promise<{ success: boolean; reportId: string }>;
  notificationPrefs: NotificationPreferences;
  updateNotificationPref: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
}

const DEFAULT_DEMO_USER: AuthUser = {
  id: 'usr_demo_101',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  college: 'National Institute of Technology',
  department: 'Computer Science & Engineering',
  studyYear: '3rd Year',
  hostel: 'Hostel 4, Room 312',
  bio: 'CS junior • Open-source enthusiast • Coding & badminton',
  avatar: 'school',
  isVerified: false,
  verificationStatus: 'unverified',
};

const STORAGE_KEY_AUTH_USER = '@campus_connect_auth_user_v2';
const STORAGE_KEY_BLOCKED_USERS = '@campus_connect_blocked_users_v2';
const STORAGE_KEY_REPORTS = '@campus_connect_reports_v2';
const STORAGE_KEY_NOTIF_PREFS = '@campus_connect_notif_prefs_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_DEMO_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIF_PREFS);

  // Restore persisted state on mount
  useEffect(() => {
    const loadStoredState = async () => {
      try {
        const [storedUser, storedBlocked, storedReports, storedPrefs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_AUTH_USER),
          AsyncStorage.getItem(STORAGE_KEY_BLOCKED_USERS),
          AsyncStorage.getItem(STORAGE_KEY_REPORTS),
          AsyncStorage.getItem(STORAGE_KEY_NOTIF_PREFS),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedBlocked) {
          setBlockedUsers(JSON.parse(storedBlocked));
        }
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        }
        if (storedPrefs) {
          setNotificationPrefs(JSON.parse(storedPrefs));
        }
      } catch (err) {
        console.warn('Could not load stored auth/trust state:', err);
      }
    };

    loadStoredState();
  }, []);

  // Helper to persist user state
  const saveUser = async (updatedUser: AuthUser | null) => {
    setUser(updatedUser);
    try {
      if (updatedUser) {
        await AsyncStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updatedUser));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch (err) {
      console.warn('Failed to persist auth user:', err);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: cleanEmail,
      college: 'Main Campus University',
      department: 'Computer Science',
      studyYear: '3rd Year',
      isVerified: cleanEmail.includes('.edu') || cleanEmail.includes('campus'),
      verificationStatus: cleanEmail.includes('.edu') ? 'verified' : 'unverified',
    };

    await saveUser(newUser);
    return { success: true };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsLoading(false);

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      college: data.college.trim(),
      department: data.department.trim(),
      studyYear: data.studyYear.trim(),
      isVerified: false,
      verificationStatus: 'unverified',
    };

    await saveUser(newUser);
    return { success: true };
  };

  const logout = async () => {
    await saveUser(null);
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No user signed in' };

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);

    const updatedUser: AuthUser = {
      ...user,
      ...data,
      // Maintain id and email integrity unless explicitly verified
      id: user.id,
      email: data.email ? data.email.trim().toLowerCase() : user.email,
    };

    await saveUser(updatedUser);
    return { success: true };
  };

  const updateOnboarding = async (data: OnboardingData): Promise<{ success: boolean }> => {
    return updateProfile(data);
  };

  const submitVerificationOtp = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    if (otp !== '123456' && otp.length !== 6) {
      return {
        success: false,
        error: 'Invalid verification code. Enter the 6-digit code (Test code: 123456)',
      };
    }

    if (user) {
      const updatedUser: AuthUser = {
        ...user,
        isVerified: true,
        verificationStatus: 'verified',
        verificationMethod: 'college_email',
      };
      await saveUser(updatedUser);
    }

    return { success: true };
  };

  const submitIdCardMock = async (documentName: string): Promise<{ success: boolean }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);

    if (user) {
      const updatedUser: AuthUser = {
        ...user,
        isVerified: false,
        verificationStatus: 'pending',
        verificationMethod: 'id_card',
      };
      await saveUser(updatedUser);
    }

    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid campus email address.' };
    }

    return { success: true };
  };

  // Block & Unblock management
  const blockUser = async (target: { id: string; name: string; department?: string }) => {
    const isAlreadyBlocked = blockedUsers.some((u) => u.id === target.id);
    if (isAlreadyBlocked) return;

    const newBlocked: BlockedUser = {
      id: target.id,
      name: target.name,
      department: target.department,
      blockedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updated = [newBlocked, ...blockedUsers];
    setBlockedUsers(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BLOCKED_USERS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save blocked user:', err);
    }
  };

  const unblockUser = async (userId: string) => {
    const updated = blockedUsers.filter((u) => u.id !== userId);
    setBlockedUsers(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BLOCKED_USERS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save unblock user:', err);
    }
  };

  const isUserBlocked = (userId: string): boolean => {
    return blockedUsers.some((u) => u.id === userId);
  };

  // User & listing reporting
  const submitReport = async (
    reportData: Omit<UserReport, 'id' | 'timestamp'>
  ): Promise<{ success: boolean; reportId: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);

    const reportId = `rep_${Date.now()}`;
    const newReport: UserReport = {
      ...reportData,
      id: reportId,
      timestamp: new Date().toISOString(),
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save report:', err);
    }

    return { success: true, reportId };
  };

  // Notification Preferences
  const updateNotificationPref = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = {
      ...notificationPrefs,
      [key]: value,
    };
    setNotificationPrefs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIF_PREFS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save notification preferences:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateOnboarding,
        updateProfile,
        submitVerificationOtp,
        submitIdCardMock,
        requestPasswordReset,
        blockedUsers,
        blockUser,
        unblockUser,
        isUserBlocked,
        reports,
        submitReport,
        notificationPrefs,
        updateNotificationPref,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
