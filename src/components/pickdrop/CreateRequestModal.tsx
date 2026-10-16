import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { ContactPreference } from '../../types';
import { CAMPUS_LOCATIONS } from '../../data/demoData';
import { AppTextInput } from '../common/AppTextInput';
import { AppButton } from '../common/AppButton';

interface CreateRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    itemName: string;
    itemDescription: string;
    pickupLocation: string;
    dropoffLocation: string;
    preferredDateTime: string;
    reward?: number;
    additionalInstructions?: string;
    contactPreference: ContactPreference;
  }) => Promise<{ success: boolean; error?: string }>;
}

const CONTACT_PREFERENCES: ContactPreference[] = [
  'In-App Campus Chat',
  'WhatsApp / Phone',
  'Meet at Campus Hub / Library',
];

const QUICK_TIMES = [
  'Urgent (Within 45 mins)',
  'Today by 2:00 PM',
  'Today by 5:00 PM',
  'This Evening (7–9 PM)',
  'Tomorrow Morning (9–11 AM)',
];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [reward, setReward] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('In-App Campus Chat');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemName('');
    setItemDescription('');
    setPickupLocation('');
    setDropoffLocation('');
    setPreferredDateTime('');
    setReward('');
    setAdditionalInstructions('');
    setContactPreference('In-App Campus Chat');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Please enter what needs to be picked up.';
    } else if (itemName.trim().length < 3) {
      newErrors.itemName = 'Item name should be at least 3 characters.';
    }

    if (!itemDescription.trim()) {
      newErrors.itemDescription = 'Please describe the package and handling details.';
    }

    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pick-up location is required.';
    }

    if (!dropoffLocation.trim()) {
      newErrors.dropoffLocation = 'Drop-off destination is required.';
    } else if (
      pickupLocation.trim().toLowerCase() === dropoffLocation.trim().toLowerCase() &&
      pickupLocation.trim() !== ''
    ) {
      newErrors.dropoffLocation = 'Drop-off location must be different from pick-up spot.';
    }

    if (!preferredDateTime.trim()) {
      newErrors.preferredDateTime = 'Please specify when you need this delivered.';
    }

    if (reward.trim()) {
      const parsedReward = Number(reward);
      if (isNaN(parsedReward) || parsedReward < 0) {
        newErrors.reward = 'Reward cannot be negative.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const numReward = reward.trim() ? Number(reward) : undefined;
      const res = await onSubmit({
        itemName: itemName.trim(),
        itemDescription: itemDescription.trim(),
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        preferredDateTime: preferredDateTime.trim(),
        reward: numReward,
        additionalInstructions: additionalInstructions.trim() || undefined,
        contactPreference,
      });

      if (res.success) {
        Alert.alert(
          'Request Published!',
          `Your campus delivery request for "${itemName}" has been posted.\n\nFellow students nearby can view this errand and volunteer to assist.`,
          [{ text: 'Great!', onPress: handleClose }]
        );
      } else {
        Alert.alert('Unable to Create Request', res.error || 'Please check the details.');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>New Pick & Drop Request</Text>
              <Text style={styles.headerSubtitle}>
                Request a campus runner for packages, books, food, or prints
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Campus Safety Reminder */}
            <View style={styles.safetyCallout}>
              <Ionicons name="shield-checkmark" size={16} color={colors.accentDark} />
              <Text style={styles.safetyCalloutText}>
                Campus Policy: Deliveries must only be scheduled between authorized campus locations. Never request delivery of prohibited or unsafe goods.
              </Text>
            </View>

            {/* 1. Item Name */}
            <AppTextInput
              label="Item to Pick Up *"
              placeholder="e.g. Spiral Bound Seminar Report, Lab Manual, Amazon Box"
              value={itemName}
              onChangeText={(text) => {
                setItemName(text);
                if (errors.itemName) setErrors((prev) => ({ ...prev, itemName: '' }));
              }}
              error={errors.itemName}
              leftIcon="cube-outline"
            />

            {/* 2. Item Description */}
            <AppTextInput
              label="Item Description & Handling Notes *"
              placeholder="Describe size, fragility, or what the runner should verify..."
              value={itemDescription}
              onChangeText={(text) => {
                setItemDescription(text);
                if (errors.itemDescription) setErrors((prev) => ({ ...prev, itemDescription: '' }));
              }}
              error={errors.itemDescription}
              multiline
              numberOfLines={3}
              leftIcon="document-text-outline"
            />

            {/* 3. Pick-up Location */}
            <View style={styles.fieldSection}>
              <AppTextInput
                label="Pick-up Location *"
                placeholder="e.g. Central Library, Food Court, Lab 3"
                value={pickupLocation}
                onChangeText={(text) => {
                  setPickupLocation(text);
                  if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: '' }));
                }}
                error={errors.pickupLocation}
                leftIcon="radio-button-on"
              />

              <Text style={styles.quickLabel}>Popular campus spots:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {CAMPUS_LOCATIONS.slice(0, 6).map((loc) => (
                  <TouchableOpacity
                    key={`pickup-${loc}`}
                    style={[
                      styles.quickChip,
                      pickupLocation === loc && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      setPickupLocation(loc);
                      if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: '' }));
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        pickupLocation === loc && styles.quickChipTextActive,
                      ]}
                    >
                      {loc.split('(')[0].trim()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 4. Drop-off Location */}
            <View style={styles.fieldSection}>
              <AppTextInput
                label="Drop-off Destination *"
                placeholder="e.g. Hostel 4 Room 312, Science Block Reception"
                value={dropoffLocation}
                onChangeText={(text) => {
                  setDropoffLocation(text);
                  if (errors.dropoffLocation) setErrors((prev) => ({ ...prev, dropoffLocation: '' }));
                }}
                error={errors.dropoffLocation}
                leftIcon="location"
              />

              <Text style={styles.quickLabel}>Popular dorms & spots:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {CAMPUS_LOCATIONS.slice(3, 9).map((loc) => (
                  <TouchableOpacity
                    key={`dropoff-${loc}`}
                    style={[
                      styles.quickChip,
                      dropoffLocation === loc && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      setDropoffLocation(loc);
                      if (errors.dropoffLocation) setErrors((prev) => ({ ...prev, dropoffLocation: '' }));
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        dropoffLocation === loc && styles.quickChipTextActive,
                      ]}
                    >
                      {loc.split('(')[0].trim()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 5. Preferred Date and Time */}
            <View style={styles.fieldSection}>
              <AppTextInput
                label="Preferred Date & Time *"
                placeholder="e.g. Today by 4:30 PM, Urgent within 1 hour"
                value={preferredDateTime}
                onChangeText={(text) => {
                  setPreferredDateTime(text);
                  if (errors.preferredDateTime) setErrors((prev) => ({ ...prev, preferredDateTime: '' }));
                }}
                error={errors.preferredDateTime}
                leftIcon="time-outline"
              />

              <Text style={styles.quickLabel}>Quick time slots:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {QUICK_TIMES.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.quickChip,
                      preferredDateTime === time && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      setPreferredDateTime(time);
                      if (errors.preferredDateTime) setErrors((prev) => ({ ...prev, preferredDateTime: '' }));
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        preferredDateTime === time && styles.quickChipTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 6. Optional Runner Reward */}
            <AppTextInput
              label="Runner Reward / Tip (Optional ₹)"
              placeholder="e.g. 50 (peer appreciation reward)"
              value={reward}
              onChangeText={(text) => {
                setReward(text);
                if (errors.reward) setErrors((prev) => ({ ...prev, reward: '' }));
              }}
              error={errors.reward}
              keyboardType="numeric"
              leftIcon="cash-outline"
              helperText="Suggested: ₹40 - ₹80 for cross-campus walking errands"
            />

            {/* 7. Contact Preference */}
            <View style={styles.fieldSection}>
              <Text style={styles.sectionTitle}>Contact Preference</Text>
              <View style={styles.prefGrid}>
                {CONTACT_PREFERENCES.map((pref) => {
                  const isSelected = contactPreference === pref;
                  return (
                    <TouchableOpacity
                      key={pref}
                      style={[styles.prefButton, isSelected && styles.prefButtonActive]}
                      onPress={() => setContactPreference(pref)}
                    >
                      <Ionicons
                        name={
                          pref === 'In-App Campus Chat'
                            ? 'chatbubble-ellipses-outline'
                            : pref === 'WhatsApp / Phone'
                            ? 'call-outline'
                            : 'people-outline'
                        }
                        size={15}
                        color={isSelected ? colors.accentDark : colors.textSecondary}
                      />
                      <Text
                        style={[styles.prefButtonText, isSelected && styles.prefButtonTextActive]}
                      >
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 8. Additional Instructions */}
            <AppTextInput
              label="Additional Instructions (Optional)"
              placeholder="e.g. Call when outside hostel gate, leave with guard if absent..."
              value={additionalInstructions}
              onChangeText={setAdditionalInstructions}
              multiline
              numberOfLines={2}
              leftIcon="information-circle-outline"
            />

            {/* Actions */}
            <View style={styles.actionButtons}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="md"
                onPress={handleClose}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton
                title={isSubmitting ? 'Posting...' : 'Post Delivery'}
                variant="accent"
                size="md"
                onPress={handleSubmit}
                loading={isSubmitting}
                icon="paper-plane-outline"
                style={{ flex: 2 }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  safetyCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  safetyCalloutText: {
    fontSize: 11,
    color: colors.accentDark,
    lineHeight: 16,
    marginLeft: spacing.xs,
    flex: 1,
  },
  fieldSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  chipRow: {
    marginBottom: spacing.sm,
  },
  quickChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickChipActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentDark,
  },
  quickChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  quickChipTextActive: {
    color: colors.accentDark,
    fontWeight: typography.fontWeights.bold,
  },
  prefGrid: {
    gap: spacing.xs,
  },
  prefButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  prefButtonActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentDark,
  },
  prefButtonText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeights.medium,
  },
  prefButtonTextActive: {
    color: colors.accentDark,
    fontWeight: typography.fontWeights.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
