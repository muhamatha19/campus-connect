# Campus Connect 🎓

> **Your Campus. Your Community.**

Campus Connect is a campus-exclusive mobile application built with **React Native, Expo (SDK 57), and TypeScript**. It provides college students with an all-in-one platform to buy and sell items, request peer assistance, coordinate campus courier deliveries, chat with verified students, and manage their campus activity with built-in trust and safety features.

---

## 📱 Features Overview

### 1. Authentication & Student Onboarding (Part 2)
- **Student Sign In & Sign Up**: Form validation with email, password, college, department, and academic study year.
- **Student Onboarding**: Multi-step personalization with customizable student avatars, hostel room info, and bio.
- **Campus Verification**: Institutional proof workflow supporting `.edu` email one-time password (OTP) and student ID card document review.
- **Account Recovery**: Password reset workflow with instructional guidance.
- **Community Honor Code & Terms**: Dedicated modal and screen outlining the 0% student fee guarantee and academic integrity policies.

### 2. Student Marketplace (Part 3)
- **Browse & Search**: Live keyword search and category filtering (Books & Notes, Electronics, Lab Equipment, College Supplies, Clothing, Other).
- **Listing Details**: Condition badges, original vs. discounted pricing, student seller details, campus meetup spot, and preferred contact mode.
- **Create & Edit Listings**: Image selection, pricing validation, condition chips, and campus location tagging.
- **Wishlist & My Listings**: Saved favourites with one-tap toggle and dedicated "My Listings" management with deletion.
- **Local Persistence**: Offline AsyncStorage caching across app reloads.

### 3. Campus Tasks & Student Services (Part 4)
- **Peer Errands & Academic Help**: Browse tasks for campus shop purchases, note delivery, textbook collection, printing/photocopying, and tutoring.
- **Status Lifecycle**: Open ➔ Accepted ➔ In Progress ➔ Completed (or Cancelled).
- **Post a Task**: Location inputs (pickup & destination), deadline, contact preference, and optional student reward.
- **My Tasks Management**: Dedicated tabs for "My Posted Tasks" and "My Accepted Tasks" with duplicate acceptance locking.

### 4. Campus Pick-up & Drop-off (Part 5)
- **Campus Courier Errands**: Request peer deliveries across campus buildings, hostel halls, libraries, and cafeterias.
- **Step-by-Step Status Tracker**: 6 visual transit checkpoints (`Requested` ➔ `Accepted` ➔ `Pickup in progress` ➔ `Picked up` ➔ `On the way` ➔ `Delivered`).
- **Route Summary Cards**: Clear pickup-to-drop-off route summaries with campus-safe handover guidelines (no paid map APIs required).
- **Runner Simulation**: Demo advance button to test the complete step-by-step courier transit flow.

### 5. Chat UI & Campus Notifications (Part 6)
- **In-App Student Messages**: Topic-linked conversations (Marketplace, Tasks, Pick & Drop, General) with peer verification indicators.
- **Conversation Screen**: Message bubbles (isMe vs. peer), timestamps, quick reply suggestions, and unread badges.
- **Campus Alerts & Notifications**: Categorized alerts for task status updates, marketplace inquiries, courier transit milestones, and university announcements.

### 6. Profile, Activity Center & Basic Trust (Part 7)
- **Student Profile**: Displays genuine student verification status (`Verified`, `Pending Review`, or `Unverified`). No fabricated ratings or fake verification badges.
- **Unified Activity Center**: Segmented tabs for All Activity Timeline, My Listings, Saved Wishlist, Posted Tasks, Accepted Tasks, and Courier Errands directly connected to context state without data duplication.
- **Settings & Privacy**: Notification toggles (tasks, marketplace, chat, courier, announcements) persisted to storage, FAQ accordion, privacy transparency disclosure, and sign-out confirmation.
- **Trust & Moderation Tools**:
  - **Report Modal**: Contextual reporting for users, listings, tasks, or errands with 5 campus policy reasons and transparent mock disclosure.
  - **Blocked Students Manager**: Block peers directly from chat and manage unblocking in Settings.
  - **Campus Safety Guidelines Modal**: 5-point student exchange safety principles (public spaces, inspecting before paying, checking student badges, zero tolerance for prohibited items).

### 7. Final Stabilization & Backend Readiness (Part 8)
- Clean service contracts and TypeScript interfaces in `src/services/api/` for future **FastAPI** backend and **MongoDB** database integration.
- Full Expo SDK 57 verification passing all diagnostics with 0 errors.

---

## 🛠️ Technology Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | Expo (Expo Go compatible) | `~57.0.9` |
| **Runtime** | React Native | `0.86.3` |
| **Language** | TypeScript | `~6.0.3` |
| **Library** | React | `19.2.3` |
| **Navigation** | React Navigation (Native Stack + Bottom Tabs) | `^7.5.1` / `^7.21.0` |
| **Storage** | React Native AsyncStorage | `2.2.0` |
| **Icons** | `@expo/vector-icons` (Ionicons) | `^15.0.2` |
| **Safe Area** | `react-native-safe-area-context` | `~5.7.0` |
| **Screens** | `react-native-screens` | `~4.26.0` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Android Expo Go app version **57.0.9** (or Android Emulator / iOS Simulator)

### Installation
```bash
# Clone or navigate to the project directory
cd campus-connect

# Install dependencies (strictly pinned for Expo SDK 57)
npm install
```

### Running the Application
```bash
# Start Expo development server
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator
npm run ios

# Run in Web browser
npm run web
```

---

## 🧪 Project Validation Commands

Run these automated commands to verify type safety and project health:

```bash
# 1. TypeScript Strict Verification (Must output 0 errors)
npx tsc --noEmit

# 2. Expo Doctor Project Health Check (Must pass 21/21 checks)
npx expo-doctor

# 3. Hermes Production Android Bundle Test
npx expo export -p android --output-dir dist
```

---

## 📂 Project Structure

```
campus-connect/
├── assets/                       # App icons, splash screens, and adaptive icons
├── src/
│   ├── components/
│   │   ├── common/               # Reusable UI: AppButton, AppBadge, AppTextInput, SearchBar, HeaderBar...
│   │   ├── marketplace/          # ListingDetailModal, CreateEditListingModal, ProductCard
│   │   ├── tasks/                # TaskCard, TaskDetailModal, CreateTaskModal
│   │   ├── pickdrop/             # PickDropCard, RequestDetailModal, CreateRequestModal, StatusTracker
│   │   ├── onboarding/           # WelcomeModal (interactive tour)
│   │   └── trust/                # ReportModal, CampusSafetyModal
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth state, profile editing, blocked users, reports, notification prefs
│   │   ├── MarketplaceContext.tsx# Listings CRUD, favorites, category & search filtering
│   │   ├── TasksContext.tsx      # Peer task requests, status transitions, acceptance locking
│   │   ├── PickDropContext.tsx   # Campus courier errands, 6-checkpoint status flow
│   │   ├── ChatContext.tsx       # Local demo chat threads, message sending, unread badges
│   │   └── NotificationsContext.tsx # Notification feed, read/unread status, category filtering
│   ├── data/
│   │   └── demoData.ts           # Realistic student seed data for NIT campus demo
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Full stack navigation (auth, modals, screens)
│   │   └── TabNavigator.tsx      # Bottom tabs (Home, Marketplace, Tasks, Pick & Drop, Profile)
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Dashboard, featured items, quick actions, highlights
│   │   ├── MarketplaceScreen.tsx # Marketplace feed, search, filter chips, create/edit
│   │   ├── TasksScreen.tsx       # Peer tasks list, status filters, posting modal
│   │   ├── PickDropScreen.tsx    # Courier errands, tracker, runner simulation
│   │   ├── ProfileScreen.tsx     # Student profile, real counters, safety cards
│   │   ├── auth/                 # Login, Signup, ForgotPassword, Onboarding, Verification, Terms
│   │   ├── chat/                 # ChatInboxScreen, ChatConversationScreen
│   │   ├── notifications/        # NotificationsScreen with category filters
│   │   └── profile/              # EditProfileScreen, SettingsScreen, ActivityHistoryScreen
│   ├── services/
│   │   ├── index.ts              # Service layer entry point
│   │   └── api/                  # FastAPI & MongoDB DTOs, endpoint maps, and service interfaces
│   ├── theme/
│   │   ├── colors.ts             # Accessible student campus color palette
│   │   ├── spacing.ts            # Spacing, borderRadius, and typography tokens
│   │   ├── shadows.ts            # Elevation and shadow tokens
│   │   └── index.ts
│   └── types/
│       └── index.ts              # Centralized domain types, interfaces, navigation param lists
├── App.tsx                       # App entry with nested context providers & theme
├── app.json                      # Expo application manifest
├── package.json                  # Pinned dependencies
├── tsconfig.json                 # TypeScript strict compiler configuration
└── README.md                     # Comprehensive project documentation
```

---

## ⚠️ Demo Behavior & Prototyping Disclosures

1. **Local-First Mock Data**: All marketplace listings, tasks, deliveries, chat threads, and notifications are stored locally on the device using `@react-native-async-storage/async-storage`. They persist across app reloads for testing, but are not broadcast to a remote server.
2. **Password Security in Demo**: Passwords are validated ephemerally on the client to simulate authentication flows and are **never** stored in device storage or logs.
3. **No Fabricated Badges or Ratings**: User verification reflects actual state (`unverified` by default unless verified via OTP test code `123456`). No fake ratings (e.g. 5-star ratings or fabricated karma scores) are used.
4. **Moderation Reports**: Reports submitted through the `ReportModal` are logged locally in state for UI testing. They are not transmitted to a live university moderation board or security office in this offline prototype.
5. **No Paid Map APIs**: The Pick & Drop courier feature uses structured campus route cards (e.g., *Hostel 4 ➔ Central Library*) rather than paid Google Maps/GPS APIs.

---

## 🔌 Future Backend Integration (FastAPI + MongoDB)

The application has been structured with clean service contracts located in `src/services/api/`:

| Module | FastAPI Route Prefix | MongoDB Collection | Service Interface |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/v1/auth` | `users` | `IAuthService` |
| **Marketplace** | `/api/v1/marketplace` | `products` | `IMarketplaceService` |
| **Campus Tasks** | `/api/v1/tasks` | `tasks` | `ITasksService` |
| **Pick & Drop** | `/api/v1/pickdrop` | `pickdrop_requests`| `IPickDropService` |
| **Chat & Messages**| `/api/v1/chat` | `conversations`, `messages` | `IChatService` |
| **Notifications** | `/api/v1/notifications` | `notifications` | Backend push service |
| **Trust & Safety** | `/api/v1/moderation` | `reports`, `blocked_users` | `ITrustService` |

### Steps to Connect the Live Backend:
1. Deploy the FastAPI backend and configure CORS for mobile clients.
2. Set `API_CONFIG.BASE_URL` in `src/services/api/apiConfig.ts` to your server's host or LAN IP.
3. Implement `fetch` / `axios` API client classes implementing the interfaces in `src/services/api/`.
4. Swap the local AsyncStorage methods in context providers (`AuthContext`, `MarketplaceContext`, etc.) to call the respective backend service methods.

---

## 📄 License
This project is licensed under the MIT License.
