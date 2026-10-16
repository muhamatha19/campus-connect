import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { Category } from '../../types';

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => onSelect(category)}
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          isSelected ? styles.iconWrapSelected : styles.iconWrapUnselected,
        ]}
      >
        <Ionicons
          name={category.icon}
          size={16}
          color={isSelected ? colors.white : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.label,
          isSelected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {category.name}
      </Text>
      {category.badgeCount !== undefined && !isSelected && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{category.badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  chipUnselected: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    ...shadows.md,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  iconWrapUnselected: {
    backgroundColor: colors.primaryLight,
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  labelUnselected: {
    color: colors.text,
  },
  labelSelected: {
    color: colors.white,
  },
  countBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
  },
  countText: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
});
