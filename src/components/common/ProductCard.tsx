import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { Product } from '../../types';
import { AppBadge } from './AppBadge';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
  isOwnedByMe?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  isOwnedByMe = false,
}) => {
  const formatPostedDate = (createdAt?: string, timeAgo?: string) => {
    if (timeAgo) return timeAgo;
    if (!createdAt) return 'Recently';
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(product)}
      style={styles.card}
    >
      {/* Product Image / Icon Visual Box */}
      <View
        style={[
          styles.imageBox,
          { backgroundColor: product.accentColor || colors.primaryLight },
        ]}
      >
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={product.iconName} size={42} color={colors.primary} />
        )}

        {/* Condition Tag */}
        <View style={styles.conditionTag}>
          <Text style={styles.conditionText}>{product.condition}</Text>
        </View>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.favoriteButton}
            accessibilityLabel={isFavorite ? 'Remove from saved' : 'Save listing'}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.danger : colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Time / Posted Date Tag */}
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={10} color={colors.white} />
          <Text style={styles.timeText}>
            {formatPostedDate(product.createdAt, product.timeAgo)}
          </Text>
        </View>
      </View>

      {/* Product Content */}
      <View style={styles.content}>
        <View style={styles.topMetaRow}>
          <AppBadge label={product.category} variant="primary" size="sm" />
          {isOwnedByMe ? (
            <AppBadge label="Your Listing" variant="accent" size="sm" />
          ) : (
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{product.sellerRating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPriceText}>₹{product.originalPrice}</Text>
            )}
          </View>
        </View>

        {/* Footer: Seller & Campus Location */}
        <View style={styles.footer}>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {product.sellerName.charAt(0)}
              </Text>
            </View>
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.sellerName}
            </Text>
            {product.sellerVerified && (
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={colors.accent}
                style={styles.verifiedIcon}
              />
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {product.campusLocation}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageBox: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.surfaceSecondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  conditionTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    ...shadows.sm,
  },
  conditionText: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  timeTag: {
    position: 'absolute',
    bottom: spacing.xs + 2,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(23, 32, 51, 0.72)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  timeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
  },
  content: {
    padding: spacing.md,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.primary,
  },
  originalPriceText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '52%',
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  sellerInitial: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  sellerName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  verifiedIcon: {
    marginLeft: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '46%',
    gap: 2,
  },
  locationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
});
