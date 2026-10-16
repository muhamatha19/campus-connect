import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { IconName } from '../../types';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: colors.secondary },
          text: { color: colors.white },
          iconColor: colors.white,
        };
      case 'accent':
        return {
          button: { backgroundColor: colors.accent },
          text: { color: colors.white },
          iconColor: colors.white,
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
          iconColor: colors.primary,
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
          iconColor: colors.primary,
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: colors.primary },
          text: { color: colors.white },
          iconColor: colors.white,
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          button: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm },
          text: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
          iconSize: 16,
        };
      case 'lg':
        return {
          button: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, borderRadius: borderRadius.lg },
          text: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold },
          iconSize: 22,
        };
      case 'md':
      default:
        return {
          button: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md },
          text: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semiBold },
          iconSize: 18,
        };
    }
  };

  const vStyle = getVariantStyles();
  const sStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyle.button,
        sStyle.button,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text.color} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sStyle.iconSize}
              color={vStyle.iconColor}
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.baseText, vStyle.text, sStyle.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sStyle.iconSize}
              color={vStyle.iconColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.55,
  },
  leftIcon: {
    marginRight: spacing.xs + 2,
  },
  rightIcon: {
    marginLeft: spacing.xs + 2,
  },
});
