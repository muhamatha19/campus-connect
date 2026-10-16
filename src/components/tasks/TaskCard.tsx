import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { TaskItem, TaskStatus } from '../../types';
import { AppBadge } from '../common/AppBadge';

interface TaskCardProps {
  task: TaskItem;
  onPress: (task: TaskItem) => void;
  isOwnedByMe?: boolean;
  isAcceptedByMe?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  isOwnedByMe = false,
  isAcceptedByMe = false,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Open':
        return { label: 'Open', variant: 'accent' as const };
      case 'Accepted':
        return { label: 'Accepted', variant: 'primary' as const };
      case 'In Progress':
        return { label: 'In Progress', variant: 'warning' as const };
      case 'Completed':
        return { label: 'Completed', variant: 'success' as const };
      case 'Cancelled':
        return { label: 'Cancelled', variant: 'neutral' as const };
    }
  };

  const statusBadge = getStatusBadge(task.status);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(task)}
      style={[
        styles.card,
        task.status === 'Completed' && styles.cardCompleted,
        task.status === 'Cancelled' && styles.cardCancelled,
      ]}
    >
      {/* Top Meta Row: Category, Urgency, Status */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <AppBadge label={task.category} variant="secondary" size="sm" />
          {task.urgency === 'high' && task.status === 'Open' && (
            <AppBadge label="Urgent" variant="danger" size="sm" style={{ marginLeft: 6 }} />
          )}
          {isOwnedByMe && (
            <AppBadge label="You Posted" variant="primary" size="sm" style={{ marginLeft: 6 }} />
          )}
          {isAcceptedByMe && (
            <AppBadge label="Assigned to You" variant="accent" size="sm" style={{ marginLeft: 6 }} />
          )}
        </View>

        <AppBadge label={statusBadge.label} variant={statusBadge.variant} size="sm" />
      </View>

      {/* Title & Reward Header */}
      <View style={styles.titleRewardRow}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.rewardAmount}>
            {task.reward > 0 ? `₹${task.reward}` : 'Volunteer'}
          </Text>
        </View>
      </View>

      {/* Description Preview */}
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      {/* Campus Route & Locations */}
      <View style={styles.routeContainer}>
        {task.pickupLocation && (
          <View style={styles.locationItem}>
            <View style={styles.pickupDot} />
            <Text style={styles.locationPrefix}>Pickup:</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {task.pickupLocation}
            </Text>
          </View>
        )}

        <View style={styles.locationItem}>
          <Ionicons name="location" size={13} color={colors.primary} style={styles.destIcon} />
          <Text style={styles.locationPrefix}>Deliver to:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {task.destinationLocation}
          </Text>
        </View>
      </View>

      {/* Footer: Requester & Timing */}
      <View style={styles.footer}>
        <View style={styles.requesterRow}>
          <View style={styles.requesterAvatar}>
            <Text style={styles.avatarInitial}>{task.requesterName.charAt(0)}</Text>
          </View>
          <View>
            <View style={styles.nameWithCheck}>
              <Text style={styles.requesterName} numberOfLines={1}>
                {task.requesterName}
              </Text>
              {task.requesterVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={colors.accent}
                  style={{ marginLeft: 3 }}
                />
              )}
            </View>
            <Text style={styles.postedTimeText}>{task.postedTime}</Text>
          </View>
        </View>

        <View style={styles.deadlineContainer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.deadlineText}>{task.deadline}</Text>
        </View>
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
  cardCompleted: {
    opacity: 0.88,
    backgroundColor: '#F8FAFC',
  },
  cardCancelled: {
    opacity: 0.65,
    backgroundColor: '#F1F3F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  titleRewardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
  },
  rewardContainer: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    alignItems: 'flex-end',
  },
  rewardLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondaryDark,
    textTransform: 'uppercase',
  },
  rewardAmount: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.secondary,
  },
  description: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  routeContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 6,
    marginLeft: 2,
  },
  destIcon: {
    marginRight: 4,
  },
  locationPrefix: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semiBold,
    marginRight: 4,
  },
  locationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs + 4,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '65%',
  },
  requesterAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  avatarInitial: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  nameWithCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requesterName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  postedTimeText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  deadlineText: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
});
