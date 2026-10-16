import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { Product, RootStackParamList } from '../../types';
import { AppBadge } from '../common/AppBadge';
import { AppButton } from '../common/AppButton';
import { useChat } from '../../context/ChatContext';

import { ReportModal } from '../trust/ReportModal';

interface ListingDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isOwnedByMe?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  visible,
  product,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  isOwnedByMe = false,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getOrCreateConversation } = useChat();
  const [reportVisible, setReportVisible] = React.useState(false);

  if (!product) return null;

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Listing?',
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(product.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleContactPress = async () => {
    onClose();
    const convId = await getOrCreateConversation({
      peerId: product.sellerId,
      peerName: product.sellerName,
      peerDepartment: 'Campus Student',
      peerVerified: product.sellerVerified,
      topicType: 'Marketplace',
      topicTitle: product.title,
      topicReferenceId: product.id,
    });
    navigation.navigate('ChatConversation', { conversationId: convId });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Listing Details
          </Text>
          <TouchableOpacity
            onPress={() => onToggleFavorite?.(product.id)}
            style={styles.headerIconBtn}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.danger : colors.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Visual Image / Icon Box */}
          <View
            style={[
              styles.imageBox,
              { backgroundColor: product.accentColor || colors.primaryLight },
            ]}
          >
            {product.imageUri ? (
              <Image source={{ uri: product.imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name={product.iconName} size={64} color={colors.primary} />
                <Text style={styles.placeholderLabel}>{product.category}</Text>
              </View>
            )}

            <View style={styles.conditionPill}>
              <Text style={styles.conditionPillText}>{product.condition}</Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.body}>
            {/* Category and Owned Badge */}
            <View style={styles.tagRow}>
              <AppBadge label={product.category} variant="primary" size="md" />
              {isOwnedByMe && (
                <AppBadge label="Your Demo Listing" variant="accent" size="md" style={{ marginLeft: 8 }} />
              )}
            </View>

            {/* Title */}
            <Text style={styles.title}>{product.title}</Text>

            {/* Pricing Card */}
            <View style={styles.pricingCard}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>₹{product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.originalPriceValue}>₹{product.originalPrice}</Text>
                  )}
                </View>
              </View>

              {product.originalPrice && product.originalPrice > product.price && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>

            {/* Seller & Meetup Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Seller</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.avatarLetter}>{product.sellerName.charAt(0)}</Text>
                </View>

                <View style={styles.sellerDetails}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{product.sellerName}</Text>
                    {product.sellerVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={colors.accent}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={colors.warning} />
                    <Text style={styles.ratingNumber}>{product.sellerRating.toFixed(1)} Rating</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.verifiedText}>
                      {product.sellerVerified ? 'Verified Student' : 'Campus Member'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Meetup & Contact Preferences */}
            <View style={styles.prefCard}>
              <View style={styles.prefRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <View style={styles.prefContent}>
                  <Text style={styles.prefLabel}>Campus Meetup Location</Text>
                  <Text style={styles.prefValue}>{product.campusLocation}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.prefRow}>
                <Ionicons name="chatbubbles-outline" size={18} color={colors.secondary} />
                <View style={styles.prefContent}>
                  <Text style={styles.prefLabel}>Contact Preference</Text>
                  <Text style={styles.prefValue}>{product.contactPreference}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            {isOwnedByMe ? (
              <View style={styles.ownerActionsRow}>
                <AppButton
                  title="Edit Listing"
                  variant="outline"
                  size="md"
                  icon="create-outline"
                  onPress={() => {
                    onClose();
                    onEdit?.(product);
                  }}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <AppButton
                  title="Delete"
                  variant="accent"
                  size="md"
                  icon="trash-outline"
                  onPress={handleDeletePress}
                  style={{ flex: 1, backgroundColor: colors.danger }}
                />
              </View>
            ) : (
              <View style={styles.buyerActions}>
                <AppButton
                  title={`Contact ${product.sellerName.split(' ')[0]}`}
                  variant="primary"
                  size="lg"
                  icon="chatbubble-ellipses-outline"
                  onPress={handleContactPress}
                  fullWidth
                />
                <View style={styles.safetyCard}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentDark} />
                  <Text style={styles.safetyCardText}>
                    Campus Safety: Exchange items in busy public locations like the Library lobby.
                    Inspect condition before payment.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.reportListingBtn}
                  onPress={() => setReportVisible(true)}
                >
                  <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.reportListingText}>Report this listing</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <ReportModal
        visible={reportVisible}
        onDismiss={() => setReportVisible(false)}
        targetType="listing"
        targetId={product.id}
        targetTitle={product.title}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  imageBox: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
    marginTop: spacing.xs,
  },
  conditionPill: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  conditionPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  body: {
    padding: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  priceLabel: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.primary,
  },
  originalPriceValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  savingsText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.success,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  descriptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarLetter: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingNumber: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginLeft: 3,
  },
  dot: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginHorizontal: 5,
  },
  verifiedText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  prefCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  prefContent: {
    flex: 1,
  },
  prefLabel: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
  },
  prefValue: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs + 2,
  },
  ownerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyerActions: {
    marginTop: spacing.xs,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  safetyCardText: {
    flex: 1,
    fontSize: typography.fontSizes.xs - 1,
    color: colors.accentDark,
    lineHeight: 16,
  },
  reportListingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  reportListingText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
