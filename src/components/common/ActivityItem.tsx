import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { CampusActivity } from '../../types';
import { AppBadge } from './AppBadge';

interface ActivityItemProps {
  activity: CampusActivity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getBadgeVariant = (type: CampusActivity['badgeType']) => {
    switch (type) {
      case 'secondary':
        return 'secondary';
      case 'accent':
        return 'accent';
      case 'success':
        return 'success';
      case 'primary':
      default:
        return 'primary';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name={activity.icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {activity.title}
          </Text>
          <AppBadge
            label={activity.badgeText}
            variant={getBadgeVariant(activity.badgeType)}
            size="sm"
          />
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.actorText}>{activity.actor}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.timeText}>{activity.timeAgo}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actorText: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
  },
  dotSeparator: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  timeText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textMuted,
  },
});
