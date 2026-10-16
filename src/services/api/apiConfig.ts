/**
 * ============================================================================
 * [API CONFIGURATION — FASTAPI BACKEND CLIENT]
 * ============================================================================
 * Centralized client configuration, endpoints map, and headers generator
 * ready for FastAPI backend deployment.
 * ============================================================================
 */

export const API_CONFIG = {
  // Base URL pointing to FastAPI server (e.g., http://10.0.2.2:8000 for Android emulator or LAN IP)
  BASE_URL: 'http://10.0.2.2:8000/api/v1',
  TIMEOUT_MS: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Authentication & Verification
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_OTP: '/auth/verify-otp',
    SUBMIT_ID_CARD: '/auth/verify-id-card',
    RESET_PASSWORD: '/auth/forgot-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  // User Profile
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me/profile',
    GET_USER_BY_ID: (userId: string) => `/users/${userId}`,
  },
  // Marketplace
  MARKETPLACE: {
    LIST_PRODUCTS: '/marketplace/products',
    GET_PRODUCT: (id: string) => `/marketplace/products/${id}`,
    CREATE_PRODUCT: '/marketplace/products',
    UPDATE_PRODUCT: (id: string) => `/marketplace/products/${id}`,
    DELETE_PRODUCT: (id: string) => `/marketplace/products/${id}`,
    TOGGLE_FAVORITE: (id: string) => `/marketplace/products/${id}/favorite`,
    MY_LISTINGS: '/marketplace/my-listings',
    FAVORITES: '/marketplace/favorites',
  },
  // Campus Tasks
  TASKS: {
    LIST_TASKS: '/tasks',
    GET_TASK: (id: string) => `/tasks/${id}`,
    CREATE_TASK: '/tasks',
    ACCEPT_TASK: (id: string) => `/tasks/${id}/accept`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    CANCEL_TASK: (id: string) => `/tasks/${id}/cancel`,
    MY_POSTED: '/tasks/my-posted',
    MY_ACCEPTED: '/tasks/my-accepted',
  },
  // Pick & Drop
  PICKDROP: {
    LIST_REQUESTS: '/pickdrop',
    GET_REQUEST: (id: string) => `/pickdrop/${id}`,
    CREATE_REQUEST: '/pickdrop',
    ACCEPT_DELIVERY: (id: string) => `/pickdrop/${id}/accept`,
    ADVANCE_STATUS: (id: string) => `/pickdrop/${id}/status`,
    CANCEL_REQUEST: (id: string) => `/pickdrop/${id}/cancel`,
    MY_REQUESTS: '/pickdrop/my-requests',
    MY_RUNS: '/pickdrop/my-runs',
  },
  // Chat & Messaging
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    GET_CONVERSATION: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (convId: string) => `/chat/conversations/${convId}/messages`,
    SEND_MESSAGE: (convId: string) => `/chat/conversations/${convId}/messages`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  // Moderation & Trust
  MODERATION: {
    SUBMIT_REPORT: '/moderation/reports',
    BLOCK_USER: (userId: string) => `/moderation/users/${userId}/block`,
    UNBLOCK_USER: (userId: string) => `/moderation/users/${userId}/unblock`,
    BLOCKED_USERS: '/moderation/users/blocked',
  },
};
