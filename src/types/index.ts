import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export type MarketplaceCategory =
  | 'All'
  | 'Books and notes'
  | 'Electronics'
  | 'Lab equipment'
  | 'College supplies'
  | 'Clothing and accessories'
  | 'Other';

export type ItemCondition = 'Brand New' | 'Like New' | 'Gently Used' | 'Fair';

export type ContactPreference =
  | 'In-App Campus Chat'
  | 'WhatsApp / Phone'
  | 'Meet at Campus Hub / Library';

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  badgeCount?: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: MarketplaceCategory;
  description: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  campusLocation: string;
  condition: ItemCondition;
  createdAt: string; // ISO date string or formatted date
  timeAgo: string;
  isFeatured?: boolean;
  accentColor?: string;
  iconName: IconName;
  imageUri?: string;
  contactPreference: ContactPreference;
}

export type TaskCategory =
  | 'All'
  | 'Buying items from the campus shop'
  | 'Printing or photocopying'
  | 'Delivering books or notes'
  | 'Collecting an item from a campus location'
  | 'Academic supplies'
  | 'Other permitted campus errands';

export type TaskStatus = 'Open' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: TaskCategory;
  pickupLocation?: string;
  destinationLocation: string;
  deadline: string;
  contactPreference: ContactPreference;
  requesterId: string;
  requesterName: string;
  requesterVerified: boolean;
  postedTime: string;
  createdAt: string;
  status: TaskStatus;
  urgency: 'high' | 'normal';
  acceptedById?: string;
  acceptedByName?: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface CampusActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  timeAgo: string;
  actor: string;
  icon: IconName;
  badgeText: string;
  badgeType: 'primary' | 'secondary' | 'accent' | 'success';
}

export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  lightColor: string;
  targetTab: 'Marketplace' | 'Tasks' | 'PickDrop';
  actionType: 'sell' | 'task' | 'pickdrop';
}

export interface WelcomeSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: IconName;
  accentColor: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface AuthUser {
  id: string;
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
}

export type RootTabParamList = {
  Home: undefined;
  Marketplace: { category?: MarketplaceCategory; searchQuery?: string } | undefined;
  Tasks: undefined;
  PickDrop: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  StudentOnboarding: { email?: string; name?: string } | undefined;
  CampusVerification: { email?: string } | undefined;
  TermsPrivacy: undefined;
  MainApp: undefined;
  ChatInbox: undefined;
  ChatConversation: { conversationId: string };
  Notifications: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ActivityHistory: { initialTab?: 'marketplace' | 'saved' | 'tasks_posted' | 'tasks_accepted' | 'pickdrop' | 'timeline' } | undefined;
};

export type PickDropStatus =
  | 'Requested'
  | 'Accepted'
  | 'Pickup in progress'
  | 'Picked up'
  | 'On the way'
  | 'Delivered'
  | 'Cancelled';

export interface PickDropRequest {
  id: string;
  itemName: string;
  itemDescription: string;
  pickupLocation: string;
  dropoffLocation: string;
  preferredDateTime: string;
  reward?: number;
  additionalInstructions?: string;
  contactPreference: ContactPreference;
  status: PickDropStatus;
  requesterId: string;
  requesterName: string;
  requesterHostel?: string;
  runnerId?: string;
  runnerName?: string;
  runnerRating?: number;
  createdAt: string;
  timeAgo: string;
  estimatedTransitTime?: string;
}

/**
 * ============================================================================
 * [PART 6 — CHAT & NOTIFICATIONS TYPES]
 * ============================================================================
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "11:24 AM"
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export type ConversationTopicType = 'Marketplace' | 'Tasks' | 'PickDrop' | 'General';

export interface ChatConversation {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  peerDepartment?: string;
  peerVerified: boolean;
  topicType: ConversationTopicType;
  topicTitle: string;
  topicReferenceId?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageTimeAgo: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export type NotificationCategory = 'Task' | 'Marketplace' | 'PickDrop' | 'Message' | 'Announcement';

export interface CampusNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  targetScreen?: keyof RootStackParamList | keyof RootTabParamList;
  targetParams?: Record<string, any>;
  icon: IconName;
  iconColor?: string;
}

/**
 * ============================================================================
 * [PART 7 — TRUST, REPORTING & SAFETY TYPES]
 * ============================================================================
 */

export type ReportReason =
  | 'Inappropriate or Prohibited Item'
  | 'Misleading Description or Price'
  | 'Unverified Identity or Suspicious Behavior'
  | 'Harassment or Offensive Language'
  | 'Other Campus Safety Concern';

export interface UserReport {
  id: string;
  targetId: string;
  targetType: 'user' | 'listing' | 'task' | 'pickdrop';
  targetTitle: string;
  reason: ReportReason;
  notes?: string;
  timestamp: string;
}

export interface BlockedUser {
  id: string;
  name: string;
  department?: string;
  blockedAt: string;
}

export interface NotificationPreferences {
  taskUpdates: boolean;
  marketplaceAlerts: boolean;
  chatMessages: boolean;
  courierDelivery: boolean;
  campusAnnouncements: boolean;
  emailDigest: boolean;
}



