import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { AppBadge } from '../../components/common/AppBadge';
import { ReportModal } from '../../components/trust/ReportModal';
import { CampusSafetyModal } from '../../components/trust/CampusSafetyModal';

type ConversationRouteProp = RouteProp<RootStackParamList, 'ChatConversation'>;
type ConversationNavProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_REPLIES = [
  'Is this still available?',
  'Can we meet at Central Library?',
  'I am heading there now!',
  'What time works best for you?',
  'Thank you for your help!',
];

export const ChatConversationScreen: React.FC = () => {
  const route = useRoute<ConversationRouteProp>();
  const navigation = useNavigation<ConversationNavProp>();
  const { conversationId } = route.params;

  const { conversations, sendMessage, markConversationAsRead } = useChat();
  const { blockUser } = useAuth();

  const conversation = conversations.find((c) => c.id === conversationId);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [safetyModalVisible, setSafetyModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mark conversation as read on screen open
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');
    try {
      await sendMessage(conversationId, text);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  const handlePeerMenu = () => {
    if (!conversation) return;
    Alert.alert(
      conversation.peerName,
      `Campus Trust & Safety Options (${conversation.peerDepartment || 'Student'})`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Campus Safety Tips',
          onPress: () => setSafetyModalVisible(true),
        },
        {
          text: `Report ${conversation.peerName}`,
          style: 'destructive',
          onPress: () => setReportModalVisible(true),
        },
        {
          text: `Block ${conversation.peerName}`,
          style: 'destructive',
          onPress: handleBlockUser,
        },
      ]
    );
  };

  const handleBlockUser = () => {
    if (!conversation) return;
    Alert.alert(
      `Block ${conversation.peerName}?`,
      'They will no longer be able to send you messages or view your campus listings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block Student',
          style: 'destructive',
          onPress: async () => {
            await blockUser({
              id: conversation.peerId,
              name: conversation.peerName,
              department: conversation.peerDepartment,
            });
            Alert.alert('Student Blocked', `${conversation.peerName} has been blocked.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Conversation not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
            <Text style={styles.backButtonSimpleText}>Return to Inbox</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = conversation.peerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

        {/* Peer Info */}
        <View style={styles.peerAvatar}>
          <Text style={styles.peerInitials}>{initials}</Text>
          {conversation.peerVerified && (
            <View style={styles.peerVerifiedDot}>
              <Ionicons name="checkmark" size={9} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.peerInfoWrap}>
          <View style={styles.peerNameRow}>
            <Text style={styles.peerName} numberOfLines={1}>
              {conversation.peerName}
            </Text>
            {conversation.peerVerified && (
              <AppBadge label="Verified Student" variant="accent" size="sm" />
            )}
          </View>
          <Text style={styles.peerSub} numberOfLines={1}>
            {conversation.peerDepartment}
          </Text>
        </View>

        {/* Options / Trust Menu */}
        <TouchableOpacity
          onPress={handlePeerMenu}
          style={styles.moreBtn}
          accessibilityLabel="Trust & Safety Options"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Context Item Ribbon */}
      <View style={styles.contextRibbon}>
        <Ionicons name="pricetag-outline" size={13} color={colors.primary} />
        <Text style={styles.contextRibbonLabel}>Topic: </Text>
        <Text style={styles.contextRibbonTitle} numberOfLines={1}>
          {conversation.topicTitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages Thread */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Peer Safety Banner */}
          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={16} color={colors.accentDark} />
            <Text style={styles.safetyText}>
              Campus Peer Exchange: Arrange meetups in well-lit campus spaces (hostels, library, SAC). Never share passwords or payment OTPs.
            </Text>
          </View>

          {/* Date Stamp */}
          <View style={styles.dateStamp}>
            <Text style={styles.dateStampText}>Today</Text>
          </View>

          {conversation.messages.length === 0 ? (
            <View style={styles.emptyThread}>
              <View style={styles.emptyThreadIcon}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyThreadTitle}>No messages yet</Text>
              <Text style={styles.emptyThreadDesc}>
                Send a message to coordinate with {conversation.peerName} regarding {conversation.topicTitle}.
              </Text>
            </View>
          ) : (
            conversation.messages.map((msg) => {
              const isMe = msg.isMe;

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowPeer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleMe : styles.messageBubblePeer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextMe : styles.messageTextPeer,
                      ]}
                    >
                      {msg.text}
                    </Text>

                    <View style={styles.timestampRow}>
                      <Text
                        style={[
                          styles.messageTime,
                          isMe ? styles.messageTimeMe : styles.messageTimePeer,
                        ]}
                      >
                        {msg.formattedTime}
                      </Text>
                      {isMe && (
                        <Ionicons
                          name="checkmark-done"
                          size={13}
                          color={colors.accentLight}
                          style={styles.deliveryTick}
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Quick Canned Replies Carousel */}
        <View style={styles.quickRepliesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRepliesScroll}>
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.quickReplyChip}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a student message..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={400}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? colors.white : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onDismiss={() => setReportModalVisible(false)}
        targetType="user"
        targetId={conversation.peerId}
        targetTitle={conversation.peerName}
      />

      {/* Campus Safety Modal */}
      <CampusSafetyModal
        visible={safetyModalVisible}
        onDismiss={() => setSafetyModalVisible(false)}
      />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  peerAvatar: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  peerInitials: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  peerVerifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  peerInfoWrap: {
    flex: 1,
  },
  peerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  peerName: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  peerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  contextRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
  },
  contextRibbonLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginLeft: 4,
  },
  contextRibbonTitle: {
    fontSize: 11,
    color: colors.primaryDark,
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentLight,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  safetyText: {
    fontSize: 11,
    color: colors.accentDark,
    lineHeight: 16,
    marginLeft: spacing.xs,
    flex: 1,
  },
  dateStamp: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  dateStampText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm + 2,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowPeer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...shadows.sm,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubblePeer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  messageTextMe: {
    color: colors.white,
  },
  messageTextPeer: {
    color: colors.text,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  messageTimePeer: {
    color: colors.textMuted,
  },
  deliveryTick: {
    marginLeft: 3,
  },
  emptyThread: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyThreadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyThreadTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  emptyThreadDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickRepliesSection: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: spacing.xs + 2,
  },
  quickRepliesScroll: {
    paddingHorizontal: spacing.md,
  },
  quickReplyChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickReplyText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  textInput: {
    color: colors.text,
    fontSize: typography.fontSizes.sm,
    maxHeight: 80,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButtonSimple: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backButtonSimpleText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
});
