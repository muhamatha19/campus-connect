import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { PickDropRequest, PickDropStatus, RootStackParamList } from '../../types';
import { StatusTracker } from './StatusTracker';
import { RouteSummaryCard } from './RouteSummaryCard';
import { AppBadge } from '../common/AppBadge';
import { AppButton } from '../common/AppButton';
import { useChat } from '../../context/ChatContext';
import { ReportModal } from '../trust/ReportModal';

interface RequestDetailModalProps {
  visible: boolean;
  request: PickDropRequest | null;
  onClose: () => void;
  onCancelRequest?: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  onAcceptDelivery?: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  onAdvanceStatus?: (requestId: string) => Promise<{ success: boolean; newStatus?: PickDropStatus; error?: string }>;
  currentUserId?: string;
}

const getStatusBadgeConfig = (status: PickDropStatus): {
  label: string;
  variant: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'success';
} => {
  switch (status) {
    case 'Requested':
      return { label: 'Requested', variant: 'primary' };
    case 'Accepted':
      return { label: 'Runner Assigned', variant: 'secondary' };
    case 'Pickup in progress':
      return { label: 'At Pickup Point', variant: 'warning' };
    case 'Picked up':
      return { label: 'Package Collected', variant: 'accent' };
    case 'On the way':
      return { label: 'Transit In Progress', variant: 'accent' };
    case 'Delivered':
      return { label: 'Delivered Safely', variant: 'success' };
    case 'Cancelled':
      return { label: 'Cancelled', variant: 'danger' };
  }
};

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  visible,
  request,
  onClose,
  onCancelRequest,
  onAcceptDelivery,
  onAdvanceStatus,
  currentUserId = '',
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getOrCreateConversation } = useChat();

  const [isProcessing, setIsProcessing] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  if (!request) return null;

  const isRequester = request.requesterId === currentUserId;
  const isRunner = request.runnerId === currentUserId;
  const canCancel = isRequester && request.status !== 'Delivered' && request.status !== 'Cancelled';
  const canAccept = !isRequester && request.status === 'Requested';
  const canAdvance = request.status !== 'Delivered' && request.status !== 'Cancelled';
  const hasChatPartner = isRequester ? !!request.runnerName : true;

  const handleOpenChat = async () => {
    onClose();
    const peerId = isRequester ? (request.runnerId || 'usr_runner') : request.requesterId;
    const peerName = isRequester ? (request.runnerName || 'Campus Runner') : request.requesterName;
    const convId = await getOrCreateConversation({
      peerId,
      peerName,
      peerDepartment: 'Campus Errand',
      peerVerified: true,
      topicType: 'PickDrop',
      topicTitle: request.itemName,
      topicReferenceId: request.id,
    });
    navigation.navigate('ChatConversation', { conversationId: convId });
  };

  const badge = getStatusBadgeConfig(request.status);

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Delivery Request?',
      `Are you sure you want to cancel the request for "${request.itemName}"?\n\nIf a peer runner was already assigned, they will be notified immediately.`,
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Yes, Cancel Request',
          style: 'destructive',
          onPress: async () => {
            if (!onCancelRequest) return;
            setIsProcessing(true);
            try {
              const res = await onCancelRequest(request.id);
              if (res.success) {
                Alert.alert('Request Cancelled', 'Your delivery request has been cancelled.');
                onClose();
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel request.');
              }
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleAcceptPress = async () => {
    Alert.alert(
      'Volunteer as Campus Runner?',
      `Would you like to deliver "${request.itemName}" from ${request.pickupLocation} to ${request.dropoffLocation}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Errand',
          onPress: async () => {
            if (!onAcceptDelivery) return;
            setIsProcessing(true);
            try {
              const res = await onAcceptDelivery(request.id);
              if (res.success) {
                Alert.alert(
                  'Delivery Accepted!',
                  `You are now assigned as the student runner for this request.\n\nPlease head to ${request.pickupLocation} to collect the package.`
                );
              } else {
                Alert.alert('Unable to Accept', res.error || 'Could not accept this errand.');
              }
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleAdvanceStep = async () => {
    if (!onAdvanceStatus) return;
    setIsProcessing(true);
    try {
      const res = await onAdvanceStatus(request.id);
      if (res.success) {
        Alert.alert(
          'Status Advanced (Demo Simulation)',
          `Delivery status moved to: "${res.newStatus}".\n\nThe status tracker timeline and live checkpoints have been updated.`
        );
      } else {
        Alert.alert('Status Error', res.error || 'Could not advance status.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <View style={styles.statusPillRow}>
                <AppBadge label={badge.label} variant={badge.variant} size="sm" />
                {isRequester && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Your Request</Text>
                  </View>
                )}
                {isRunner && (
                  <View style={[styles.roleBadge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.roleBadgeText, { color: colors.accentDark }]}>Your Run</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {request.itemName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Step-by-Step Status Tracker */}
            <StatusTracker status={request.status} />

            {/* 2. Pickup & Drop-off Route Summary */}
            <RouteSummaryCard
              pickupLocation={request.pickupLocation}
              dropoffLocation={request.dropoffLocation}
              estimatedTransitTime={request.estimatedTransitTime}
              showSafetyReminder={true}
            />

            {/* 3. Item Description & Handling Information */}
            <View style={styles.infoCard}>
              <Text style={styles.infoSectionHeader}>Package Description</Text>
              <Text style={styles.infoDescription}>{request.itemDescription}</Text>

              {request.additionalInstructions && (
                <View style={styles.instructionsBox}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: spacing.xs }}>
                    <Text style={styles.instructionsTitle}>Handling Instructions:</Text>
                    <Text style={styles.instructionsText}>{request.additionalInstructions}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* 4. Delivery Schedule & Reward Details */}
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <View style={styles.metaItemContent}>
                  <Text style={styles.metaLabel}>Preferred Schedule</Text>
                  <Text style={styles.metaValue}>{request.preferredDateTime}</Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={18} color={colors.accentDark} />
                <View style={styles.metaItemContent}>
                  <Text style={styles.metaLabel}>Student Runner Tip</Text>
                  <Text style={styles.metaValue}>
                    {request.reward ? `₹${request.reward}` : 'Volunteer Peer Errand'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.secondary} />
                <View style={styles.metaItemContent}>
                  <Text style={styles.metaLabel}>Contact Channel</Text>
                  <Text style={styles.metaValue}>{request.contactPreference}</Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                <View style={styles.metaItemContent}>
                  <Text style={styles.metaLabel}>Posted When</Text>
                  <Text style={styles.metaValue}>{request.timeAgo}</Text>
                </View>
              </View>
            </View>

            {/* 5. Requester & Runner Profiles */}
            <View style={styles.peopleSection}>
              {/* Requester */}
              <View style={styles.personCard}>
                <View style={styles.personAvatar}>
                  <Ionicons name="person" size={16} color={colors.primary} />
                </View>
                <View style={styles.personDetails}>
                  <Text style={styles.personRole}>REQUESTER</Text>
                  <Text style={styles.personName}>{request.requesterName}</Text>
                  {request.requesterHostel && (
                    <Text style={styles.personSub}>{request.requesterHostel}</Text>
                  )}
                </View>
              </View>

              {/* Runner (if assigned) */}
              <View style={styles.personCard}>
                <View
                  style={[
                    styles.personAvatar,
                    { backgroundColor: request.runnerName ? colors.accentLight : colors.surfaceSecondary },
                  ]}
                >
                  <Ionicons
                    name="bicycle"
                    size={16}
                    color={request.runnerName ? colors.accentDark : colors.textMuted}
                  />
                </View>
                <View style={styles.personDetails}>
                  <Text style={styles.personRole}>STUDENT RUNNER</Text>
                  <Text
                    style={[
                      styles.personName,
                      !request.runnerName && { color: colors.textMuted, fontStyle: 'italic' },
                    ]}
                  >
                    {request.runnerName || 'Waiting for runner...'}
                  </Text>
                  {request.runnerRating && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.ratingText}>{request.runnerRating} Rating</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* 6. Demo Lifecycle Simulator Tool */}
            {canAdvance && (
              <View style={styles.demoSimulatorBox}>
                <View style={styles.demoHeader}>
                  <Ionicons name="construct-outline" size={14} color={colors.secondary} />
                  <Text style={styles.demoHeaderText}>Demo Lifecycle Simulator</Text>
                </View>
                <Text style={styles.demoSubtext}>
                  Test how the status tracker updates step-by-step through the 6 delivery checkpoints.
                </Text>
                <AppButton
                  title="Simulate Next Status Step"
                  variant="secondary"
                  size="sm"
                  onPress={handleAdvanceStep}
                  loading={isProcessing}
                  icon="play-forward-outline"
                />
              </View>
            )}

            {/* 7. Action Buttons */}
            <View style={styles.actionsContainer}>
              {hasChatPartner && (
                <AppButton
                  title={
                    isRequester
                      ? `Chat with Runner (${request.runnerName || 'Assigned Peer'})`
                      : `Chat with Requester (${request.requesterName})`
                  }
                  variant="primary"
                  size="md"
                  icon="chatbubble-ellipses-outline"
                  onPress={handleOpenChat}
                  fullWidth
                  style={{ marginBottom: spacing.sm }}
                />
              )}

              {canAccept && (
                <AppButton
                  title="Accept Errand (Become Runner)"
                  variant="accent"
                  size="md"
                  icon="bicycle-outline"
                  onPress={handleAcceptPress}
                  loading={isProcessing}
                  fullWidth
                  style={{ marginBottom: spacing.sm }}
                />
              )}

              {canCancel && (
                <AppButton
                  title="Cancel Delivery Request"
                  variant="outline"
                  size="md"
                  icon="close-circle-outline"
                  onPress={handleCancelPress}
                  loading={isProcessing}
                  fullWidth
                  style={{ marginBottom: spacing.sm, borderColor: colors.danger }}
                  textStyle={{ color: colors.danger }}
                />
              )}

              <AppButton
                title="Close"
                variant="outline"
                size="md"
                onPress={onClose}
                fullWidth
              />

              <TouchableOpacity
                style={styles.reportErrandBtn}
                onPress={() => setReportVisible(true)}
              >
                <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.reportErrandText}>Report this delivery request</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <ReportModal
        visible={reportVisible}
        onDismiss={() => setReportVisible(false)}
        targetType="pickdrop"
        targetId={request.id}
        targetTitle={request.itemName}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    lineHeight: 24,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  infoSectionHeader: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaItemContent: {
    marginLeft: spacing.xs + 2,
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 1,
  },
  peopleSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  personCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  personDetails: {
    flex: 1,
  },
  personRole: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  personSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 3,
    fontWeight: typography.fontWeights.medium,
  },
  demoSimulatorBox: {
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoHeaderText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondaryDark,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  demoSubtext: {
    fontSize: 11,
    color: colors.secondaryDark,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  reportErrandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  reportErrandText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
