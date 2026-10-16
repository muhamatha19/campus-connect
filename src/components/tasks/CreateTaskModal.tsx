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
import { TaskCategory, ContactPreference } from '../../types';
import { AppTextInput } from '../common/AppTextInput';
import { AppButton } from '../common/AppButton';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: TaskCategory;
    pickupLocation?: string;
    destinationLocation: string;
    reward?: number;
    deadline: string;
    contactPreference: ContactPreference;
    urgency?: 'high' | 'normal';
  }) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES: TaskCategory[] = [
  'Buying items from the campus shop',
  'Printing or photocopying',
  'Delivering books or notes',
  'Collecting an item from a campus location',
  'Academic supplies',
  'Other permitted campus errands',
];

const CONTACT_PREFERENCES: ContactPreference[] = [
  'In-App Campus Chat',
  'WhatsApp / Phone',
  'Meet at Campus Hub / Library',
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Buying items from the campus shop');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [reward, setReward] = useState('80');
  const [deadline, setDeadline] = useState('Today before 5:00 PM');
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>('In-App Campus Chat');
  const [urgency, setUrgency] = useState<'high' | 'normal'>('normal');

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    destinationLocation?: string;
    reward?: string;
    deadline?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Buying items from the campus shop');
    setPickupLocation('');
    setDestinationLocation('');
    setReward('80');
    setDeadline('Today before 5:00 PM');
    setContactPreference('In-App Campus Chat');
    setUrgency('normal');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required (e.g. Return books to Central Library)';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!description.trim()) {
      newErrors.description = 'Please explain what needs to be done';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    if (!destinationLocation.trim()) {
      newErrors.destinationLocation = 'Destination / drop-off location is required';
    }

    if (!deadline.trim()) {
      newErrors.deadline = 'Expected time or deadline is required';
    }

    if (reward.trim() !== '') {
      const num = Number(reward);
      if (isNaN(num)) {
        newErrors.reward = 'Reward must be a valid number';
      } else if (num < 0) {
        newErrors.reward = 'Reward cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      pickupLocation: pickupLocation.trim() || undefined,
      destinationLocation: destinationLocation.trim(),
      reward: reward.trim() ? Math.round(Number(reward)) : 0,
      deadline: deadline.trim(),
      contactPreference,
      urgency,
    });
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        'Task Posted!',
        `Your task "${title.trim()}" is now visible to students across campus.`
      );
      resetForm();
      onClose();
    } else {
      setErrors({ general: result.error || 'Failed to post task.' });
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
          <Text style={styles.headerTitle}>Post a Campus Task</Text>
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

          {/* Title */}
          <AppTextInput
            label="Task Title *"
            placeholder="e.g. Pick up printing sheets from Central Xerox"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            error={errors.title}
          />

          {/* Category Selector */}
          <View style={styles.selectorGroup}>
            <Text style={styles.sectionLabel}>Task Category *</Text>
            <View style={styles.categoryList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                >
                  <Ionicons
                    name={
                      category === cat
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={18}
                    color={category === cat ? colors.secondary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Locations */}
          <AppTextInput
            label="Pickup Location"
            isOptional
            placeholder="e.g. Student Co-op Stationery / Library Xerox"
            value={pickupLocation}
            onChangeText={setPickupLocation}
            leftIcon="location-outline"
            helperText="Where the student helper should pick up the item or note"
          />

          <AppTextInput
            label="Drop-off / Destination Location *"
            placeholder="e.g. Hostel 4 Room 218 / Mechanical Dept Lab"
            value={destinationLocation}
            onChangeText={(d) => {
              setDestinationLocation(d);
              if (errors.destinationLocation)
                setErrors({ ...errors, destinationLocation: undefined });
            }}
            leftIcon="navigate-outline"
            error={errors.destinationLocation}
          />

          {/* Reward & Deadline */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppTextInput
                label="Student Reward (₹)"
                isOptional
                placeholder="e.g. 100 (or 0 for volunteer)"
                value={reward}
                onChangeText={(r) => {
                  setReward(r);
                  if (errors.reward) setErrors({ ...errors, reward: undefined });
                }}
                keyboardType="numeric"
                error={errors.reward}
              />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppTextInput
                label="Expected By *"
                placeholder="e.g. Today by 4 PM"
                value={deadline}
                onChangeText={(dl) => {
                  setDeadline(dl);
                  if (errors.deadline) setErrors({ ...errors, deadline: undefined });
                }}
                error={errors.deadline}
              />
            </View>
          </View>

          {/* Urgency Switch */}
          <View style={styles.urgencyBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.urgencyTitle}>Urgent Task?</Text>
              <Text style={styles.urgencySub}>Mark if needed within the next 1–2 hours</Text>
            </View>
            <TouchableOpacity
              onPress={() => setUrgency(urgency === 'high' ? 'normal' : 'high')}
              style={[styles.urgencyToggle, urgency === 'high' && styles.urgencyToggleActive]}
            >
              <Text style={[styles.urgencyToggleText, urgency === 'high' && styles.urgencyToggleTextActive]}>
                {urgency === 'high' ? '🔥 High Priority' : 'Normal'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <AppTextInput
            label="Detailed Instructions *"
            placeholder="Provide specific notes, room number, or items to ask for at the counter..."
            value={description}
            onChangeText={(desc) => {
              setDescription(desc);
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Preferred Contact */}
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
                    name={contactPreference === pref ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={contactPreference === pref ? colors.secondary : colors.textMuted}
                  />
                  <Text style={styles.preferenceText}>{pref}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notice */}
          <View style={styles.guidelineNotice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
            <Text style={styles.guidelineText}>
              Campus Tasks are meant for permitted peer assistance. Reward is transferred directly between students upon delivery confirmation.
            </Text>
          </View>

          {/* Submit */}
          <AppButton
            title="Post Task to Campus"
            onPress={handleSubmit}
            variant="secondary"
            size="lg"
            loading={isSubmitting}
            fullWidth
            style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
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
  selectorGroup: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  categoryOptionActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  categoryOptionText: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  categoryOptionTextActive: {
    color: colors.secondaryDark,
    fontWeight: typography.fontWeights.bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  urgencyTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  urgencySub: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 1,
  },
  urgencyToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
  },
  urgencyToggleActive: {
    backgroundColor: colors.dangerLight,
  },
  urgencyToggleText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  urgencyToggleTextActive: {
    color: colors.danger,
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
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  preferenceText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  guidelineNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  guidelineText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.secondaryDark,
    flex: 1,
    lineHeight: 16,
  },
});
