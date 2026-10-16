import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList, ConversationTopicType, ChatConversation } from '../../types';
import { useChat } from '../../context/ChatContext';
import { SearchBar } from '../../components/common/SearchBar';
import { AppBadge } from '../../components/common/AppBadge';

type ChatInboxNavProp = NativeStackNavigationProp<RootStackParamList>;

const TOPIC_FILTERS: ('All' | ConversationTopicType)[] = [
  'All',
  'Marketplace',
  'Tasks',
  'PickDrop',
];

const getTopicBadgeConfig = (topic: ConversationTopicType): {
  label: string;
  variant: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger';
} => {
  switch (topic) {
    case 'Marketplace':
      return { label: 'Marketplace', variant: 'primary' };
    case 'Tasks':
      return { label: 'Campus Task', variant: 'secondary' };
    case 'PickDrop':
      return { label: 'Pick & Drop', variant: 'accent' };
    default:
      return { label: 'General', variant: 'warning' };
  }
};

export const ChatInboxScreen: React.FC = () => {
  const navigation = useNavigation<ChatInboxNavProp>();
  const { conversations, unreadMessagesCount, isLoading } = useChat();

  const [selectedTopic, setSelectedTopic] = useState<'All' | ConversationTopicType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    if (selectedTopic !== 'All' && c.topicType !== selectedTopic) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.peerName.toLowerCase().includes(q);
      const matchTopic = c.topicTitle.toLowerCase().includes(q);
      const matchLast = c.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchTopic && !matchLast) return false;
    }
    return true;
  });

  const handleOpenConversation = (conv: ChatConversation) => {
    navigation.navigate('ChatConversation', { conversationId: conv.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Campus Messages</Text>
          <Text style={styles.headerSubtitle}>Direct student communication</Text>
        </View>

        {unreadMessagesCount > 0 ? (
          <View style={styles.unreadHeaderBadge}>
            <Text style={styles.unreadHeaderText}>{unreadMessagesCount} New</Text>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Offline Demo Notice */}
        <View style={styles.demoNotice}>
          <Ionicons name="chatbubbles" size={18} color={colors.primary} />
          <View style={styles.demoNoticeContent}>
            <Text style={styles.demoNoticeTitle}>Demo Student Chat</Text>
            <Text style={styles.demoNoticeText}>
              Messages are simulated peer exchanges saved locally on your device. Zero cloud relay or external server connections.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search student names, listings, tasks..."
          />
        </View>

        {/* Topic Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {TOPIC_FILTERS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <TouchableOpacity
                  key={topic}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {topic === 'PickDrop' ? 'Pick & Drop' : topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Conversations Feed */}
        <View style={styles.inboxSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : filteredConversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedTopic !== 'All'
                  ? 'Try clearing your search query or topic filter.'
                  : 'Start a conversation from Marketplace listings, Campus Tasks, or Pick & Drop errands!'}
              </Text>
            </View>
          ) : (
            filteredConversations.map((conv) => {
              const badge = getTopicBadgeConfig(conv.topicType);
              const initials = conv.peerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <TouchableOpacity
                  key={conv.id}
                  style={[
                    styles.conversationCard,
                    conv.unreadCount > 0 && styles.conversationCardUnread,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleOpenConversation(conv)}
                >
                  {/* Left: Avatar with Verified Badge */}
                  <View style={styles.avatarWrap}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                    {conv.peerVerified && (
                      <View style={styles.verifiedDot}>
                        <Ionicons name="checkmark" size={10} color={colors.white} />
                      </View>
                    )}
                  </View>

                  {/* Middle: Content */}
                  <View style={styles.contentWrap}>
                    <View style={styles.nameRow}>
                      <Text style={styles.peerName} numberOfLines={1}>
                        {conv.peerName}
                      </Text>
                      <Text style={styles.timeAgoText}>{conv.lastMessageTimeAgo}</Text>
                    </View>

                    {/* Topic Row */}
                    <View style={styles.topicRow}>
                      <AppBadge label={badge.label} variant={badge.variant} size="sm" />
                      <Text style={styles.topicTitle} numberOfLines={1}>
                        {conv.topicTitle}
                      </Text>
                    </View>

                    {/* Message Preview */}
                    <Text
                      style={[
                        styles.lastMessageText,
                        conv.unreadCount > 0 && styles.lastMessageTextUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conv.lastMessage}
                    </Text>
                  </View>

                  {/* Right: Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadPillText}>{conv.unreadCount}</Text>
                    </View>
                  )}
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
  unreadHeaderBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  unreadHeaderText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  demoNoticeContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  demoNoticeTitle: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  demoNoticeText: {
    fontSize: 11,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  filterSection: {
    marginTop: spacing.sm,
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
  inboxSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  conversationCardUnread: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  contentWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  peerName: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  timeAgoText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  lastMessageText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  lastMessageTextUnread: {
    color: colors.text,
    fontWeight: typography.fontWeights.bold,
  },
  unreadPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  unreadPillText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
