import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface HeaderBarProps {
  onNotificationPress?: () => void;
  onHelpPress?: () => void;
  onChatPress?: () => void;
  unreadNotifications?: boolean;
  unreadChat?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onNotificationPress,
  onHelpPress,
  onChatPress,
  unreadNotifications = false,
  unreadChat = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Brand & Campus Info */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="school" size={20} color={colors.white} />
        </View>
        <View style={styles.brandTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Campus</Text>
            <Text style={styles.brandTitleAccent}>Connect</Text>
          </View>
          <View style={styles.locationPill}>
            <View style={styles.onlineDot} />
            <Text style={styles.locationText}>Main Campus • Hub A</Text>
          </View>
        </View>
      </View>

      {/* Action Icons */}
      <View style={styles.actionsRow}>
        {onHelpPress && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onHelpPress}
            style={styles.iconButton}
            accessibilityLabel="Help and Onboarding"
          >
            <Ionicons name="sparkles" size={18} color={colors.secondary} />
          </TouchableOpacity>
        )}

        {onChatPress && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onChatPress}
            style={styles.iconButton}
            accessibilityLabel="Campus Messages"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.text} />
            {unreadChat && <View style={[styles.unreadDot, { backgroundColor: colors.secondary }]} />}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNotificationPress}
          style={styles.iconButton}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
          {unreadNotifications && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  brandTitleAccent: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.primary,
    letterSpacing: -0.3,
    marginLeft: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 5,
  },
  locationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
});
