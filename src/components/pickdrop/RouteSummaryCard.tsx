import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface RouteSummaryCardProps {
  pickupLocation: string;
  dropoffLocation: string;
  estimatedTransitTime?: string;
  showSafetyReminder?: boolean;
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({
  pickupLocation,
  dropoffLocation,
  estimatedTransitTime = '8-12 mins campus walk',
  showSafetyReminder = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="navigate-outline" size={16} color={colors.primary} />
          <Text style={styles.headerTitle}>Campus Route Summary</Text>
        </View>
        <View style={styles.transitBadge}>
          <Ionicons name="walk-outline" size={12} color={colors.accentDark} />
          <Text style={styles.transitBadgeText}>{estimatedTransitTime}</Text>
        </View>
      </View>

      {/* Visual Route Points */}
      <View style={styles.routeContainer}>
        {/* Pickup Item */}
        <View style={styles.pointRow}>
          <View style={styles.pointIndicatorCol}>
            <View style={[styles.pointDot, { backgroundColor: colors.accent }]}>
              <View style={styles.innerDotWhite} />
            </View>
            <View style={styles.routeDottedLine} />
          </View>
          <View style={styles.pointDetails}>
            <Text style={styles.pointCategory}>PICK-UP LOCATION</Text>
            <Text style={styles.pointTitle}>{pickupLocation}</Text>
          </View>
        </View>

        {/* Drop-off Item */}
        <View style={styles.pointRow}>
          <View style={styles.pointIndicatorCol}>
            <View style={[styles.pointDot, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={12} color={colors.white} />
            </View>
          </View>
          <View style={styles.pointDetails}>
            <Text style={styles.pointCategory}>DROP-OFF DESTINATION</Text>
            <Text style={styles.pointTitle}>{dropoffLocation}</Text>
          </View>
        </View>
      </View>

      {/* Campus Handover Safety Callout */}
      {showSafetyReminder && (
        <View style={styles.safetyBox}>
          <View style={styles.safetyIconWrapper}>
            <Ionicons name="shield-checkmark" size={16} color={colors.accentDark} />
          </View>
          <View style={styles.safetyTextWrapper}>
            <Text style={styles.safetyHeading}>Campus Safety & Handover Policy</Text>
            <Text style={styles.safetyText}>
              Always arrange handovers in public, well-lit campus spaces (hostel reception, main foyer, or departmental gate). Private phone numbers and personal room keys are protected and never shared publicly.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  transitBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.accentDark,
    marginLeft: 4,
  },
  routeContainer: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  pointDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  innerDotWhite: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  routeDottedLine: {
    width: 2,
    height: 32,
    backgroundColor: colors.border,
    marginVertical: 2,
    borderRadius: 1,
  },
  pointDetails: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  pointCategory: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pointTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  safetyIconWrapper: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  safetyTextWrapper: {
    flex: 1,
  },
  safetyHeading: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  safetyText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
