import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { ONBOARDING_SLIDES } from '../../data/demoData';
import { AppButton } from '../common/AppButton';

const { width } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  visible,
  onDismiss,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setCurrentIndex(0);
    onDismiss();
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.modalContent}>
            {/* Top Bar with Brand and Skip */}
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <Ionicons name="school" size={16} color={colors.white} />
                </View>
                <Text style={styles.brandTitle}>Campus Connect</Text>
              </View>

              <TouchableOpacity
                onPress={handleComplete}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.skipButton}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Tagline */}
            <View style={styles.taglineBox}>
              <Text style={styles.tagline}>Your Campus. Your Community.</Text>
            </View>

            {/* Slide Hero Card */}
            <View style={styles.slideContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: `${currentSlide.accentColor}18` },
                ]}
              >
                <View
                  style={[
                    styles.iconInner,
                    { backgroundColor: currentSlide.accentColor },
                  ]}
                >
                  <Ionicons
                    name={currentSlide.icon}
                    size={38}
                    color={colors.white}
                  />
                </View>
              </View>

              <Text style={styles.slideTitle}>{currentSlide.title}</Text>
              <Text style={styles.slideSubtitle}>{currentSlide.subtitle}</Text>
              <Text style={styles.slideDesc}>{currentSlide.description}</Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.dotsRow}>
              {ONBOARDING_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    currentIndex === i ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <AppButton
                title={
                  currentIndex === ONBOARDING_SLIDES.length - 1
                    ? 'Get Started • Enter Campus'
                    : 'Next Highlight'
                }
                variant="primary"
                size="lg"
                onPress={handleNext}
                fullWidth
                icon={
                  currentIndex === ONBOARDING_SLIDES.length - 1
                    ? 'checkmark-circle-outline'
                    : 'arrow-forward'
                }
                iconPosition="right"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  safeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    width: Math.min(width - 32, 420),
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  brandTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  skipButton: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  taglineBox: {
    alignSelf: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  tagline: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  slideContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  slideTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  slideSubtitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideDesc: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
    gap: spacing.xs + 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.border,
  },
  footer: {
    width: '100%',
  },
});
