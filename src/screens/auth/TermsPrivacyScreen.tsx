import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { AppButton } from '../../components/common/AppButton';

type TermsNavProp = NativeStackNavigationProp<RootStackParamList, 'TermsPrivacy'>;

export const TermsPrivacyScreen: React.FC = () => {
  const navigation = useNavigation<TermsNavProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy Notice</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={styles.badgeText}>CAMPUS HONOR CODE • V1.0</Text>
          </View>
          <Text style={styles.docTitle}>Campus Connect Community Standards</Text>
          <Text style={styles.lastUpdated}>Last updated: October 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>1. Campus-Exclusive Access</Text>
            <Text style={styles.paragraph}>
              Campus Connect is designed strictly for currently enrolled students, faculty, and authorized campus members. Commercial third-party dealers and non-campus spammers are strictly prohibited.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>2. Student Marketplace Honor Code</Text>
            <Text style={styles.paragraph}>
              • All listed textbooks, electronics, and supplies must accurately reflect their physical condition and working status.{'\n'}
              • Campus Connect charges 0% commission on peer-to-peer student transactions.{'\n'}
              • Prohibited Items: Weapons, illegal substances, prescription medication, stolen college equipment, or forged academic coursework.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>3. In-Person Meetup Safety</Text>
            <Text style={styles.paragraph}>
              Always arrange item handoffs and errand drop-offs in well-lit, public campus locations (such as the Central Library lobby, Canteen, or Main Academic Block) during active campus hours.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>4. Data Privacy Notice</Text>
            <Text style={styles.paragraph}>
              • Your institutional student email is used solely for campus verification and account security.{'\n'}
              • We do not sell or monetize student data with third-party advertising brokers.{'\n'}
              • Password hashes and credentials are cryptographically protected and never shared.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>5. Student Errand & Task Etiquette</Text>
            <Text style={styles.paragraph}>
              Students agreeing to pick-up and drop-off errands or peer tutoring must maintain punctuality and respectful communication. Mutual trust ratings reflect peer reliability.
            </Text>
          </View>
        </View>

        <AppButton
          title="I Understand & Agree"
          variant="primary"
          size="lg"
          onPress={() => navigation.goBack()}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
