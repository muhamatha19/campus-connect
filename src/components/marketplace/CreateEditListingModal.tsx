import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { Product, MarketplaceCategory, ItemCondition, ContactPreference } from '../../types';
import { AppTextInput } from '../common/AppTextInput';
import { AppButton } from '../common/AppButton';

interface CreateEditListingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: MarketplaceCategory;
    condition: ItemCondition;
    contactPreference: ContactPreference;
    campusLocation?: string;
    imageUri?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  initialProduct?: Product | null;
}

const CATEGORIES: MarketplaceCategory[] = [
  'Books and notes',
  'Electronics',
  'Lab equipment',
  'College supplies',
  'Clothing and accessories',
  'Other',
];

const CONDITIONS: ItemCondition[] = ['Brand New', 'Like New', 'Gently Used', 'Fair'];

const CONTACT_PREFERENCES: ContactPreference[] = [
  'In-App Campus Chat',
  'WhatsApp / Phone',
  'Meet at Campus Hub / Library',
];

export const CreateEditListingModal: React.FC<CreateEditListingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialProduct,
}) => {
  const isEditing = !!initialProduct;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('Books and notes');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>('In-App Campus Chat');
  const [campusLocation, setCampusLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    price?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setDescription(initialProduct.description);
      setPrice(initialProduct.price.toString());
      setOriginalPrice(initialProduct.originalPrice ? initialProduct.originalPrice.toString() : '');
      setCategory(initialProduct.category);
      setCondition(initialProduct.condition);
      setContactPreference(initialProduct.contactPreference || 'In-App Campus Chat');
      setCampusLocation(initialProduct.campusLocation);
      setImageUri(initialProduct.imageUri);
    } else {
      resetForm();
    }
    setErrors({});
  }, [initialProduct, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory('Books and notes');
    setCondition('Like New');
    setContactPreference('In-App Campus Chat');
    setCampusLocation('');
    setImageUri(undefined);
    setErrors({});
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Photo Permission Needed',
          'Permission to access camera roll is required to select item photos for your campus listing.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setImageUri(pickerResult.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error', e);
      Alert.alert('Notice', 'Could not open image gallery. You can still list your item with a category icon.');
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string; price?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required (e.g. Scientific Calculator FX-991)';
    } else if (title.trim().length < 4) {
      newErrors.title = 'Title must be at least 4 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the condition and features of your item';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const numPrice = Number(price);
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(numPrice)) {
      newErrors.price = 'Price must be a valid number';
    } else if (numPrice < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await onSubmit({
      id: initialProduct?.id,
      title: title.trim(),
      description: description.trim(),
      price: Math.round(Number(price)),
      originalPrice: originalPrice.trim() ? Math.round(Number(originalPrice)) : undefined,
      category,
      condition,
      contactPreference,
      campusLocation: campusLocation.trim() || undefined,
      imageUri,
    });
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        isEditing ? 'Listing Updated' : 'Listing Created!',
        `"${title.trim()}" is now live in the campus marketplace.`
      );
      resetForm();
      onClose();
    } else {
      setErrors({ general: result.error || 'Failed to save listing.' });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Your Listing' : 'Sell an Item on Campus'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {errors.general && (
            <View style={styles.generalErrorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Image Picker Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Item Photo (Optional)</Text>
            {imageUri ? (
              <View style={styles.imagePreviewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => setImageUri(undefined)}
                  style={styles.removePhotoBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickImage} style={styles.changePhotoBtn}>
                  <Text style={styles.changePhotoText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.8}
                style={styles.imageUploadPlaceholder}
              >
                <View style={styles.cameraIconCircle}>
                  <Ionicons name="camera-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.uploadPrompt}>Tap to select photo from gallery</Text>
                <Text style={styles.uploadSubtext}>Clear photos help items sell 3x faster</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <AppTextInput
            label="Listing Title *"
            placeholder="e.g. Casio FX-991EX Calculator / DSA Textbook"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            error={errors.title}
          />

          {/* Pricing Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppTextInput
                label="Selling Price (₹) *"
                placeholder="e.g. 450"
                value={price}
                onChangeText={(p) => {
                  setPrice(p);
                  if (errors.price) setErrors({ ...errors, price: undefined });
                }}
                keyboardType="numeric"
                error={errors.price}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppTextInput
                label="Original Price (₹)"
                isOptional
                placeholder="e.g. 950"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.selectorGroup}>
            <Text style={styles.sectionLabel}>Category *</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.selectorChip, category === cat && styles.selectorChipActive]}
                >
                  <Text
                    style={[
                      styles.selectorChipText,
                      category === cat && styles.selectorChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition Selector */}
          <View style={styles.selectorGroup}>
            <Text style={styles.sectionLabel}>Condition *</Text>
            <View style={styles.chipGrid}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  onPress={() => setCondition(cond)}
                  style={[styles.selectorChip, condition === cond && styles.selectorChipActive]}
                >
                  <Text
                    style={[
                      styles.selectorChipText,
                      condition === cond && styles.selectorChipTextActive,
                    ]}
                  >
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Preference */}
          <View style={styles.selectorGroup}>
            <Text style={styles.sectionLabel}>Preferred Contact Method *</Text>
            <View style={styles.preferenceList}>
              {CONTACT_PREFERENCES.map((pref) => (
                <TouchableOpacity
                  key={pref}
                  onPress={() => setContactPreference(pref)}
                  style={[styles.preferenceRow, contactPreference === pref && styles.preferenceRowActive]}
                >
                  <Ionicons
                    name={
                      contactPreference === pref
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={18}
                    color={contactPreference === pref ? colors.primary : colors.textMuted}
                  />
                  <Text style={styles.preferenceText}>{pref}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <AppTextInput
            label="Description *"
            placeholder="Describe the condition, usage period, reasons for selling, and what is included..."
            value={description}
            onChangeText={(d) => {
              setDescription(d);
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Campus Location */}
          <AppTextInput
            label="Campus Meetup Spot"
            isOptional
            placeholder="e.g. Hostel 4 Common Room, Central Library"
            value={campusLocation}
            onChangeText={setCampusLocation}
            leftIcon="location-outline"
          />

          {/* Notice */}
          <View style={styles.guidelineNotice}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentDark} />
            <Text style={styles.guidelineText}>
              Campus Connect 0% Student Commission. Always meet in well-lit public campus spots.
            </Text>
          </View>

          {/* Submit Button */}
          <AppButton
            title={isEditing ? 'Save Changes' : 'Post Listing on Marketplace'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            loading={isSubmitting}
            fullWidth
            style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.md + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  generalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  generalErrorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    flex: 1,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  imageUploadPlaceholder: {
    height: 120,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  cameraIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  uploadPrompt: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  uploadSubtext: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  imagePreviewBox: {
    height: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceSecondary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.danger,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(23, 32, 51, 0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  changePhotoText: {
    fontSize: typography.fontSizes.xs,
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorGroup: {
    marginBottom: spacing.lg,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  selectorChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  selectorChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  selectorChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  preferenceList: {
    gap: spacing.xs,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  preferenceRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  preferenceText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  guidelineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  guidelineText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.accentDark,
    flex: 1,
    lineHeight: 16,
  },
});
