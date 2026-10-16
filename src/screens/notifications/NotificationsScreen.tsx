import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList, RootTabParamList, NotificationCategory, CampusNotification } from '../../types';
import { useNotifications } from '../../context/NotificationsContext';
import { AppBadge } from '../../components/common/AppBadge';

type NotifStackNavProp = NativeStackNavigationProp<RootStackParamList>;
type NotifTabNavProp = BottomTabNavigationProp<RootTabParamList>;

type FilterOption = 'All' | 'Unread' | NotificationCategory;

const FILTER_OPTIONS: FilterOption[] = [
  'All',
  'Unread',
  'Task',
  'Marketplace',
  'PickDrop',
  'Message',
  'Announcement',
];

const getCategoryBadge = (cat: NotificationCategory): {
  label: string;
  variant: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'success';
} => {
  switch (cat) {
    case 'Task':
      return { label: 'Task Update', variant: 'secondary' };
    case 'Marketplace':
      return { label: 'Marketplace', variant: 'primary' };
    case 'PickDrop':
      return { label: 'Pick & Drop', variant: 'accent' };
    case 'Message':
      return { label: 'Message', variant: 'secondary' };
    case 'Announcement':
      return { label: 'Campus Notice', variant: 'warning' };
  }
};

export const NotificationsScreen: React.FC = () => {
  const stackNav = useNavigation<NotifStackNavProp>();
  const tabNav = useNavigation<NotifTabNavProp>();

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'All') return true;
    return n.category === activeFilter;
  });

  const handleNotificationPress = async (n: CampusNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }

    if (n.targetScreen) {
      if (n.targetScreen === 'ChatInbox') {
        stackNav.navigate('ChatInbox');
      } else if (n.targetScreen === 'Marketplace') {
        tabNav.navigate('Marketplace');
      } else if (n.targetScreen === 'Tasks') {
        tabNav.navigate('Tasks');
      } else if (n.targetScreen === 'PickDrop') {
        tabNav.navigate('PickDrop');
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      Alert.alert('All Caught Up', 'You have no unread notifications.');
      return;
    }
    await markAllAsRead();
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Remove Notification?', `Dismiss "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteNotification(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => stackNav.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Campus Alerts</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filters Carousel */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = activeFilter === opt;
              const label = opt === 'PickDrop' ? 'Pick & Drop' : opt;

              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setActiveFilter(opt)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Notifications List */}
        <View style={styles.listSection}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'Unread'
                  ? 'Great job! You have read all campus notifications.'
                  : `No updates found in the ${activeFilter} category.`}
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notif) => {
              const badge = getCategoryBadge(notif.category);
              const isUnread = !notif.isRead;

              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifCard,
                    isUnread && styles.notifCardUnread,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleNotificationPress(notif)}
                >
                  {/* Category Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: notif.iconColor ? `${notif.iconColor}15` : colors.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name={notif.icon}
                      size={20}
                      color={notif.iconColor || colors.primary}
                    />
                  </View>

                  {/* Content */}
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeaderRow}>
                      <AppBadge label={badge.label} variant={badge.variant} size="sm" />
                      <Text style={styles.timeAgoText}>{notif.timeAgo}</Text>
                    </View>

                    <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>
                      {notif.title}
                    </Text>

                    <Text style={styles.notifDesc} numberOfLines={2}>
                      {notif.description}
                    </Text>
                  </View>

                  {/* Right Status Actions */}
                  <View style={styles.rightActionCol}>
                    {isUnread && <View style={styles.unreadDot} />}
                    <TouchableOpacity
                      onPress={() => handleDelete(notif.id, notif.title)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="close" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginLeft: 3,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  filterSection: {
    marginTop: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  listSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  notifCardUnread: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
    marginRight: spacing.xs,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeAgoText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  notifTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: 3,
  },
  notifTitleUnread: {
    fontWeight: typography.fontWeights.bold,
  },
  notifDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rightActionCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingLeft: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.sm,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
