import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { PickDropRequest, PickDropStatus } from '../../types';
import { AppBadge } from '../common/AppBadge';

interface PickDropCardProps {
  request: PickDropRequest;
  onPress: (request: PickDropRequest) => void;
  isMyRequest?: boolean;
  isMyRun?: boolean;
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
      return { label: 'At Pickup', variant: 'warning' };
    case 'Picked up':
      return { label: 'Collected', variant: 'accent' };
    case 'On the way':
      return { label: 'On The Way', variant: 'accent' };
    case 'Delivered':
      return { label: 'Delivered', variant: 'success' };
    case 'Cancelled':
      return { label: 'Cancelled', variant: 'danger' };
  }
};

export const PickDropCard: React.FC<PickDropCardProps> = ({
  request,
  onPress,
  isMyRequest = false,
  isMyRun = false,
}) => {
  const badge = getStatusBadgeConfig(request.status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress(request)}
    >
      {/* Header Row: Item Name, Status Pill & Ownership Tag */}
      <View style={styles.topRow}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIconCircle}>
            <Ionicons name="cube-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.itemName} numberOfLines={1}>
              {request.itemName}
            </Text>
            <View style={styles.subMetaRow}>
              <Text style={styles.timeAgoText}>{request.timeAgo}</Text>
              {isMyRequest && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>Your Request</Text>
                </View>
              )}
              {isMyRun && (
                <View style={[styles.youBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.youBadgeText, { color: colors.accentDark }]}>Your Active Run</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <AppBadge label={badge.label} variant={badge.variant} size="sm" />
      </View>

      {/* Description Preview */}
      <Text style={styles.description} numberOfLines={2}>
        {request.itemDescription}
      </Text>

      {/* Route Pathway Summary */}
      <View style={styles.routeBox}>
        <View style={styles.routePoint}>
          <Ionicons name="radio-button-on" size={13} color={colors.accent} style={styles.pinIcon} />
          <Text style={styles.routeText} numberOfLines={1}>
            <Text style={styles.routeSublabel}>From: </Text>
            {request.pickupLocation}
          </Text>
        </View>
        <View style={styles.routeConnector}>
          <Ionicons name="arrow-down" size={11} color={colors.textMuted} />
        </View>
        <View style={styles.routePoint}>
          <Ionicons name="location" size={13} color={colors.primary} style={styles.pinIcon} />
          <Text style={styles.routeText} numberOfLines={1}>
            <Text style={styles.routeSublabel}>To: </Text>
            {request.dropoffLocation}
          </Text>
        </View>
      </View>

      {/* Footer Info: Schedule & Reward */}
      <View style={styles.footerRow}>
        <View style={styles.scheduleInfo}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.scheduleText} numberOfLines={1}>
            {request.preferredDateTime}
          </Text>
        </View>

        <View style={styles.footerRight}>
          {request.reward !== undefined && request.reward > 0 ? (
            <View style={styles.rewardPill}>
              <Text style={styles.rewardAmount}>₹{request.reward}</Text>
              <Text style={styles.rewardLabel}>tip</Text>
            </View>
          ) : (
            <View style={styles.volunteerPill}>
              <Text style={styles.volunteerText}>Peer Errand</Text>
            </View>
          )}
        </View>
      </View>

      {/* Requester & Runner Footer */}
      <View style={styles.userFootprintRow}>
        <View style={styles.userInfoLeft}>
          <Ionicons name="person-circle-outline" size={15} color={colors.textMuted} />
          <Text style={styles.requesterText} numberOfLines={1}>
            By: {request.requesterName}
          </Text>
        </View>

        {request.runnerName && (
          <View style={styles.runnerInfoRight}>
            <Ionicons name="bicycle-outline" size={14} color={colors.accentDark} />
            <Text style={styles.runnerText} numberOfLines={1}>
              Runner: {request.runnerName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeAgoText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  youBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  description: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  routeBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 6,
  },
  routeConnector: {
    paddingLeft: 4,
    marginVertical: 1,
  },
  routeText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    flex: 1,
  },
  routeSublabel: {
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  scheduleText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  rewardAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.accentDark,
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeights.medium,
    color: colors.accentDark,
    marginLeft: 2,
  },
  volunteerPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  volunteerText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  userFootprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requesterText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  runnerInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  runnerText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.accentDark,
    marginLeft: 3,
  },
});
