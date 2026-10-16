import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { QuickActionItem } from '../../types';

interface QuickActionCardProps {
  action: QuickActionItem;
  onPress: (action: QuickActionItem) => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(action)}
      style={styles.card}
    >
      <View style={[styles.iconContainer, { backgroundColor: action.lightColor }]}>
        <Ionicons name={action.icon} size={22} color={action.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {action.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {action.subtitle}
        </Text>
      </View>
      <View style={[styles.arrowPill, { backgroundColor: action.lightColor }]}>
        <Ionicons name="arrow-forward" size={14} color={action.color} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 104,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 124,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  textContainer: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrowPill: {
    alignSelf: 'flex-start',
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
