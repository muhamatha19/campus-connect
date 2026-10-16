import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { ReportReason, UserReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppButton } from '../common/AppButton';

interface ReportModalProps {
  visible: boolean;
  onDismiss: () => void;
  targetType: 'user' | 'listing' | 'task' | 'pickdrop';
  targetId: string;
  targetTitle: string;
}

const REPORT_REASONS: { label: ReportReason; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  {
    label: 'Inappropriate or Prohibited Item',
    icon: 'ban-outline',
    desc: 'Violates campus policies, prohibited merchandise, or academic dishonesty',
  },
  {
    label: 'Misleading Description or Price',
    icon: 'alert-circle-outline',
    desc: 'Incorrect condition, deceptive price, or false claims',
  },
  {
    label: 'Unverified Identity or Suspicious Behavior',
    icon: 'person-remove-outline',
    desc: 'Refusal to meet in campus areas, suspected fake profile, or phishing',
  },
  {
    label: 'Harassment or Offensive Language',
    icon: 'chatbubble-ellipses-outline',
    desc: 'Abusive chat, offensive messages, or inappropriate conduct',
  },
  {
    label: 'Other Campus Safety Concern',
    icon: 'shield-outline',
    desc: 'Any other safety or university community policy concern',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onDismiss,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { submitReport, isLoading } = useAuth();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleDismiss = () => {
    setSelectedReason(null);
    setNotes('');
    setValidationError('');
    onDismiss();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setValidationError('Please select a reason for this report.');
      return;
    }

    setValidationError('');
    try {
      const result = await submitReport({
        targetId,
        targetType,
        targetTitle,
        reason: selectedReason,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        Alert.alert(
          'Report Submitted (Demo)',
          `Thank you for helping keep our campus safe. Your report (#${result.reportId.slice(-6)}) has been logged in this demo session.\n\nNote: In a live release, campus student moderators review reports within 24 hours.`,
          [{ text: 'Done', onPress: handleDismiss }]
        );
      }
    } catch {
      Alert.alert('Submission Error', 'Failed to submit report. Please try again.');
    }
  };

  const getTypeLabel = () => {
    switch (targetType) {
      case 'user':
        return 'Student User';
      case 'listing':
        return 'Marketplace Listing';
      case 'task':
        return 'Campus Task';
      case 'pickdrop':
        return 'Pick & Drop Request';
      default:
        return 'Item';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="flag" size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Report {getTypeLabel()}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                "{targetTitle}"
              </Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Honest Demo Disclaimer Alert */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={18} color="#92400E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimerTitle}>Local Prototype Notice</Text>
                <Text style={styles.disclaimerText}>
                  This demo records reports locally for user flow testing. Reports are not
                  forwarded to a live university moderation board or security office.
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {validationError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {/* Reason Selector */}
            <Text style={styles.sectionLabel}>Select Reason for Report *</Text>
            <View style={styles.reasonsList}>
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedReason(item.label);
                      setValidationError('');
                    }}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.reasonTitle,
                          isSelected && styles.reasonTitleSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.reasonDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Additional Comments */}
            <Text style={styles.sectionLabel}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Provide any additional context or incident details..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              maxLength={500}
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>

            {/* Actions */}
            <View style={styles.buttonRow}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={handleDismiss}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Submit Report"
                variant="primary"
                loading={isLoading}
                onPress={handleSubmit}
                style={{ flex: 1, backgroundColor: colors.danger }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '85%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  headerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  subtitle: {
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.bold,
    color: '#92400E',
  },
  disclaimerText: {
    fontSize: typography.fontSizes.xs - 1,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reasonsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  reasonCardSelected: {
    borderColor: colors.danger,
    backgroundColor: '#FFF5F5',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.danger,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  reasonTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
  },
  reasonTitleSelected: {
    color: colors.danger,
  },
  reasonDesc: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  notesInput: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 88,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
