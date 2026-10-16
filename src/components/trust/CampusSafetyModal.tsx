import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { AppButton } from '../common/AppButton';

interface CampusSafetyModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const SAFETY_TIPS = [
  {
    icon: 'business-outline' as const,
    color: colors.primary,
    title: 'Meet in Busy, Public Campus Areas',
    description:
      'Always conduct exchanges and task handovers in open, well-lit spaces like the Central Library lobby, Student Union, Campus Cafeteria, or department breezeway. Avoid private hostel rooms with strangers.',
  },
  {
    icon: 'search-outline' as const,
    color: colors.secondary,
    title: 'Inspect Items Before Completing Payment',
    description:
      'Carefully test electronics, flip through textbook pages, and verify lab equipment before handing over payment. If an item does not match the listed description, you have zero obligation to proceed.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    color: colors.accentDark,
    title: 'Check Campus Verification',
    description:
      'Look for verified student badges on peer profiles. You can politely ask to see a university ID card during in-person handoffs for high-value items or sensitive errands.',
  },
  {
    icon: 'key-outline' as const,
    color: '#D97706',
    title: 'Never Share Personal Passwords or OTPs',
    description:
      'Campus Connect will never ask for your student portal login, bank passwords, or one-time verification pins (OTPs). Keep all communication within campus chat.',
  },
  {
    icon: 'ribbon-outline' as const,
    color: colors.danger,
    title: 'University Honor Code & Prohibited Items',
    description:
      'Sale of weapons, prohibited substances, counterfeit notes, or unauthorized past exams violates campus policy. Violators face immediate account suspension and referral to university authorities.',
  },
];

export const CampusSafetyModal: React.FC<CampusSafetyModalProps> = ({
  visible,
  onDismiss,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-half" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Campus Trust & Safety</Text>
              <Text style={styles.subtitle}>Student Exchange Honor Code</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.introBanner}>
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <Text style={styles.introText}>
                Campus Connect is built on mutual student respect and peer trust. Follow these 5
                essential safety principles for every transaction and errand.
              </Text>
            </View>

            <View style={styles.tipsList}>
              {SAFETY_TIPS.map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <View style={[styles.tipIconWrapper, { backgroundColor: tip.color + '18' }]}>
                    <Ionicons name={tip.icon} size={20} color={tip.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDesc}>{tip.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.emergencyBanner}>
              <Ionicons name="call-outline" size={18} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyTitle}>Campus Security Contacts</Text>
                <Text style={styles.emergencyText}>
                  For immediate campus emergencies or safety concerns, reach out to your university
                  security dispatch or hostel proctor.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <AppButton
              title="I Understand & Agree"
              variant="primary"
              onPress={onDismiss}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    width: '100%',
    maxHeight: '85%',
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
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
    marginTop: 1,
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
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  introText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  tipsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  tipIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emergencyTitle: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.danger,
  },
  emergencyText: {
    fontSize: typography.fontSizes.xs - 1,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 15,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.card,
  },
});
