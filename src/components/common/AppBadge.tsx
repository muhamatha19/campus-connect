import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface AppBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.secondaryLight, text: colors.secondary };
      case 'accent':
        return { bg: colors.accentLight, text: colors.accentDark };
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'neutral':
        return { bg: colors.surfaceSecondary, text: colors.textSecondary };
      case 'primary':
      default:
        return { bg: colors.primaryLight, text: colors.primary };
    }
  };

  const scheme = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: scheme.bg },
        isSm ? styles.smBadge : styles.mdBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: scheme.text },
          isSm ? styles.smText : styles.mdText,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  mdBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontWeight: typography.fontWeights.semiBold,
  },
  smText: {
    fontSize: typography.fontSizes.xs,
  },
  mdText: {
    fontSize: typography.fontSizes.sm,
  },
});
