import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { PickDropStatus } from '../../types';

interface StatusTrackerProps {
  status: PickDropStatus;
}

interface StepDef {
  key: PickDropStatus;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STEPS: StepDef[] = [
  {
    key: 'Requested',
    label: '1. Request Posted',
    sublabel: 'Waiting for a campus peer runner to accept',
    icon: 'paper-plane-outline',
  },
  {
    key: 'Accepted',
    label: '2. Runner Assigned',
    sublabel: 'Student peer accepted and is heading to pickup',
    icon: 'person-outline',
  },
  {
    key: 'Pickup in progress',
    label: '3. At Pickup Point',
    sublabel: 'Runner is at location collecting package',
    icon: 'storefront-outline',
  },
  {
    key: 'Picked up',
    label: '4. Package Collected',
    sublabel: 'Item inspected and verified safely',
    icon: 'cube-outline',
  },
  {
    key: 'On the way',
    label: '5. Transit to Destination',
    sublabel: 'Walking across campus to drop-off point',
    icon: 'bicycle-outline',
  },
  {
    key: 'Delivered',
    label: '6. Delivered & Complete',
    sublabel: 'Handover verified at campus drop-off',
    icon: 'checkmark-circle-outline',
  },
];

const STATUS_ORDER: PickDropStatus[] = [
  'Requested',
  'Accepted',
  'Pickup in progress',
  'Picked up',
  'On the way',
  'Delivered',
];

export const StatusTracker: React.FC<StatusTrackerProps> = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <View style={styles.cancelledCard}>
        <View style={styles.cancelledIconCircle}>
          <Ionicons name="close-circle" size={24} color={colors.danger} />
        </View>
        <View style={styles.cancelledTextContainer}>
          <Text style={styles.cancelledTitle}>Delivery Request Cancelled</Text>
          <Text style={styles.cancelledSubtitle}>
            This campus delivery was cancelled by the requester. No student runner is active for this request.
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Live Delivery Checkpoints</Text>

      <View style={styles.stepsWrapper}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step.key} style={styles.stepRow}>
              {/* Left Column: Icon Circle & Connector Line */}
              <View style={styles.indicatorCol}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                    isUpcoming && styles.nodeUpcoming,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : isCurrent ? (
                    <Ionicons name={step.icon} size={15} color={colors.accentDark} />
                  ) : (
                    <Text style={styles.upcomingNumber}>{index + 1}</Text>
                  )}
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted ? styles.connectorCompleted : styles.connectorUpcoming,
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Text Information */}
              <View style={[styles.contentCol, !isLast && styles.contentColPadding]}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.labelCompleted,
                      isCurrent && styles.labelCurrent,
                      isUpcoming && styles.labelUpcoming,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activePill}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.activePillText}>In Progress</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <Text style={styles.doneText}>Done</Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.stepSublabel,
                    isCurrent ? styles.sublabelCurrent : styles.sublabelUpcoming,
                  ]}
                >
                  {step.sublabel}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepsWrapper: {
    paddingLeft: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.md,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.success,
  },
  nodeCurrent: {
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accentDark,
  },
  nodeUpcoming: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upcomingNumber: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.bold,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
  connectorUpcoming: {
    backgroundColor: colors.borderLight,
  },
  contentCol: {
    flex: 1,
    paddingTop: 3,
  },
  contentColPadding: {
    paddingBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  labelCompleted: {
    color: colors.text,
    fontWeight: typography.fontWeights.semiBold,
  },
  labelCurrent: {
    color: colors.accentDark,
    fontWeight: typography.fontWeights.bold,
  },
  labelUpcoming: {
    color: colors.textMuted,
  },
  doneText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success,
    fontWeight: typography.fontWeights.medium,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentDark,
    marginRight: 4,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.accentDark,
  },
  stepSublabel: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  sublabelCurrent: {
    color: colors.textSecondary,
  },
  sublabelUpcoming: {
    color: colors.textMuted,
  },
  cancelledCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  cancelledIconCircle: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.danger,
    marginBottom: 2,
  },
  cancelledSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: '#991B1B',
    lineHeight: 18,
  },
});
