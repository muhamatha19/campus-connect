import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useTasks } from '../../context/TasksContext';
import { usePickDrop } from '../../context/PickDropContext';
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationsContext';
import { ReportModal } from '../../components/trust/ReportModal';
import { CampusSafetyModal } from '../../components/trust/CampusSafetyModal';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList>;

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does student verification work?',
    answer:
      'Verification checks your institutional affiliation through college-issued .edu email OTP or student photo ID card review. We never falsely verify accounts without proof.',
  },
  {
    question: 'Does Campus Connect charge fees?',
    answer:
      'No. Campus Connect is 100% free for college students. There are 0% platform commissions on marketplace sales, peer tasks, and pick & drop errands.',
  },
  {
    question: 'What should I do if a student helper does not arrive?',
    answer:
      'Tasks and courier requests can be cancelled directly from their detail screen. You can also report suspicious behavior or block unresponsive users safely.',
  },
  {
    question: 'Where should we arrange in-person exchanges?',
    answer:
      'Always meet in public campus hubs such as the Central Library lobby, Student Union, or campus dining centers. Never invite unknown peers to private hostel rooms.',
  },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavProp>();
  const {
    user,
    logout,
    notificationPrefs,
    updateNotificationPref,
    blockedUsers,
    unblockUser,
  } = useAuth();

  const { resetToDemoData } = useMarketplace();
  const { resetToDemoTasks } = useTasks();
  const { resetToDemoRequests } = usePickDrop();
  const { resetToDemoChat } = useChat();
  const { resetToDemoNotifications } = useNotifications();

  const [safetyModalVisible, setSafetyModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [showBlockedList, setShowBlockedList] = useState(false);

  const isVerified = user?.isVerified || false;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of Campus Connect',
      'Are you sure you want to log out of your current student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Demo Data',
      'This will restore all default marketplace listings, tasks, deliveries, chat threads, and notifications to their initial state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: async () => {
            await resetToDemoData();
            await resetToDemoTasks();
            await resetToDemoRequests();
            await resetToDemoChat();
            await resetToDemoNotifications();
            Alert.alert('Reset Complete', 'All campus demo databases restored to default.');
          },
        },
      ]
    );
  };

  const handleUnblock = (userId: string, userName: string) => {
    Alert.alert(
      'Unblock Student',
      `Allow ${userName} to message you and view your campus activities again?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: async () => {
            await unblockUser(userId);
            Alert.alert('Student Unblocked', `${userName} has been unblocked.`);
          },
        },
      ]
    );
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy & Data Transparency',
      '• Local-First Prototyping: All profile details, tasks, and conversations remain in local device storage.\n• No Passwords Stored: Passwords are validated ephemerally and never logged.\n• Campus Safety: Private contact information is kept hidden; campus chat is used for all peer exchanges.',
      [{ text: 'Understood' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Trust</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account & Profile Section */}
        <Text style={styles.sectionHeader}>Campus Account</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Edit Student Profile</Text>
              <Text style={styles.rowSub}>Name, department, hostel, and interests</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, styles.rowItemBorder]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CampusVerification', { email: user?.email })}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isVerified ? colors.accentLight : '#FEF3C7' },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={isVerified ? colors.accentDark : '#D97706'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Campus Verification Status</Text>
              <Text style={styles.rowSub}>
                {isVerified ? 'Verified Student Affiliation' : 'Unverified • Submit College ID'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Notification Preferences Section */}
        <Text style={styles.sectionHeader}>Notification Preferences</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowTitle}>Peer Task Updates</Text>
              <Text style={styles.rowSub}>Alerts when tasks are accepted or completed</Text>
            </View>
            <Switch
              value={notificationPrefs.taskUpdates}
              onValueChange={(val) => updateNotificationPref('taskUpdates', val)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationPrefs.taskUpdates ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowItemBorder]}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowTitle}>Marketplace Activity</Text>
              <Text style={styles.rowSub}>Buyer inquiries, item saves, and price drops</Text>
            </View>
            <Switch
              value={notificationPrefs.marketplaceAlerts}
              onValueChange={(val) => updateNotificationPref('marketplaceAlerts', val)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationPrefs.marketplaceAlerts ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowItemBorder]}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowTitle}>Campus Chat Messages</Text>
              <Text style={styles.rowSub}>Direct messages from buyers, sellers, and runners</Text>
            </View>
            <Switch
              value={notificationPrefs.chatMessages}
              onValueChange={(val) => updateNotificationPref('chatMessages', val)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationPrefs.chatMessages ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowItemBorder]}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowTitle}>Pick & Drop Courier Alerts</Text>
              <Text style={styles.rowSub}>Step-by-step courier transit checkpoints</Text>
            </View>
            <Switch
              value={notificationPrefs.courierDelivery}
              onValueChange={(val) => updateNotificationPref('courierDelivery', val)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationPrefs.courierDelivery ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.switchRow, styles.rowItemBorder]}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.rowTitle}>Campus Announcements</Text>
              <Text style={styles.rowSub}>University safety bulletins & platform notices</Text>
            </View>
            <Switch
              value={notificationPrefs.campusAnnouncements}
              onValueChange={(val) => updateNotificationPref('campusAnnouncements', val)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationPrefs.campusAnnouncements ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Trust, Safety & Community Features */}
        <Text style={styles.sectionHeader}>Trust, Safety & Moderation</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => setSafetyModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="shield-half-outline" size={18} color={colors.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Campus Safety Guidelines</Text>
              <Text style={styles.rowSub}>Public meeting spots, verification & inspection rules</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, styles.rowItemBorder]}
            activeOpacity={0.7}
            onPress={() => setShowBlockedList(!showBlockedList)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="hand-left-outline" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Blocked Students ({blockedUsers.length})</Text>
              <Text style={styles.rowSub}>Manage peers who cannot message you</Text>
            </View>
            <Ionicons
              name={showBlockedList ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Blocked Users Inline Accordion */}
          {showBlockedList && (
            <View style={styles.blockedListContainer}>
              {blockedUsers.length === 0 ? (
                <View style={styles.emptyBlockedBox}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                  <Text style={styles.emptyBlockedText}>
                    You have not blocked any campus students.
                  </Text>
                </View>
              ) : (
                blockedUsers.map((b) => (
                  <View key={b.id} style={styles.blockedItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.blockedName}>{b.name}</Text>
                      <Text style={styles.blockedMeta}>
                        {b.department || 'Student'} • Blocked on {b.blockedAt}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unblockBtn}
                      onPress={() => handleUnblock(b.id, b.name)}
                    >
                      <Text style={styles.unblockText}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.rowItem, styles.rowItemBorder]}
            activeOpacity={0.7}
            onPress={() => setReportModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flag-outline" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Report a Safety Concern</Text>
              <Text style={styles.rowSub}>Log suspicious activity or campus policy violation</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Legal & Help Section */}
        <Text style={styles.sectionHeader}>Honor Code & Support</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TermsPrivacy')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Campus Honor Code & Terms</Text>
              <Text style={styles.rowSub}>0% student fee guarantee and academic integrity</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, styles.rowItemBorder]}
            activeOpacity={0.7}
            onPress={showPrivacyInfo}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Privacy Policy & Transparency</Text>
              <Text style={styles.rowSub}>Local session storage and no data selling</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Frequently Asked Questions */}
        <Text style={styles.sectionHeader}>Campus FAQs</Text>
        <View style={styles.card}>
          {FAQ_ITEMS.map((faq, index) => {
            const isExpanded = expandedFaqIndex === index;
            return (
              <View key={index} style={index > 0 ? styles.rowItemBorder : undefined}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedFaqIndex(isExpanded ? null : index)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Prototype Reset & Sign Out */}
        <Text style={styles.sectionHeader}>App & Session</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowItem}
            activeOpacity={0.7}
            onPress={handleResetData}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Reset All Demo Data</Text>
              <Text style={styles.rowSub}>Restore sample listings, tasks, and messages</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowItem, styles.rowItemBorder]}
            activeOpacity={0.7}
            onPress={handleSignOut}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>Sign Out</Text>
              <Text style={styles.rowSub}>End current student session</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Footer Attribution */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Campus Connect • Version 1.0.0 (Part 7 Build)</Text>
          <Text style={styles.footerDisclaimer}>
            Demo prototype built with Expo SDK 57 & React Native 0.86
          </Text>
        </View>
      </ScrollView>

      {/* Safety Guidelines Modal */}
      <CampusSafetyModal
        visible={safetyModalVisible}
        onDismiss={() => setSafetyModalVisible(false)}
      />

      {/* General Campus Incident / Concern Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onDismiss={() => setReportModalVisible(false)}
        targetType="user"
        targetId="campus_general"
        targetTitle="General Campus Safety Concern"
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
  },
  rowSub: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  blockedListContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyBlockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  emptyBlockedText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  blockedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockedName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  blockedMeta: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unblockBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unblockText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primary,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    paddingRight: spacing.sm,
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  faqAnswer: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  footerVersion: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textSecondary,
  },
  footerDisclaimer: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textMuted,
    marginTop: 2,
  },
});
