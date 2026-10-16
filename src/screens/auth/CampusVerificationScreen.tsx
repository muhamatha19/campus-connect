import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';

type VerificationNavProp = NativeStackNavigationProp<RootStackParamList, 'CampusVerification'>;
type VerificationRouteProp = RouteProp<RootStackParamList, 'CampusVerification'>;

export const CampusVerificationScreen: React.FC = () => {
  const navigation = useNavigation<VerificationNavProp>();
  const route = useRoute<VerificationRouteProp>();
  const { user, submitVerificationOtp, submitIdCardMock, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'email_otp' | 'id_card'>('email_otp');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  const targetEmail = route.params?.email || user?.email || 'student@university.edu';

  const handleSendOtp = () => {
    setOtpSent(true);
    setSuccessMessage(`Verification code sent to ${targetEmail}`);
    setError(undefined);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    const result = await submitVerificationOtp(otpCode.trim());
    if (result.success) {
      setSuccessMessage('Student status verified successfully!');
      setError(undefined);
      Alert.alert(
        'Campus Verification Approved',
        'Your institutional student status is verified. You now have full access to buy, sell, and post tasks!',
        [{ text: 'Enter Campus', onPress: () => navigation.replace('MainApp') }]
      );
    } else {
      setError(result.error || 'Invalid code.');
    }
  };

  const handleSelectIdFile = async () => {
    // Simulated ID card document selection
    const mockFileName = `student_id_${user?.name?.toLowerCase().replace(' ', '_') || 'card'}.pdf`;
    setIdFileName(mockFileName);
  };

  const handleSubmitId = async () => {
    if (!idFileName) {
      setError('Please select an ID card scan or photo first');
      return;
    }

    await submitIdCardMock(idFileName);
    Alert.alert(
      'Document Submitted for Review',
      'Your student ID card has been submitted. Status is now PENDING VERIFICATION. Student moderators review campus credentials within 24 hours.\n\nYou may browse in the meantime.',
      [{ text: 'Go to Campus Hub', onPress: () => navigation.replace('MainApp') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 3 OF 3</Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        user?.verificationStatus === 'verified'
                          ? colors.success
                          : user?.verificationStatus === 'pending'
                          ? colors.warning
                          : colors.danger,
                    },
                  ]}
                />
                <Text style={styles.statusBadgeText}>
                  {user?.verificationStatus === 'verified'
                    ? 'Verified Student'
                    : user?.verificationStatus === 'pending'
                    ? 'Verification Pending'
                    : 'Unverified Account'}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>Campus Verification</Text>
            <Text style={styles.subtitle}>
              Campus Connect is strictly exclusive to enrolled students. Verify your campus affiliation to enable marketplace selling and peer tasks.
            </Text>
          </View>

          {/* Verification Method Switcher */}
          <View style={styles.methodSwitcher}>
            <TouchableOpacity
              onPress={() => {
                setActiveTab('email_otp');
                setError(undefined);
              }}
              style={[styles.methodTab, activeTab === 'email_otp' && styles.methodTabActive]}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={activeTab === 'email_otp' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.methodTabText,
                  activeTab === 'email_otp' && styles.methodTabTextActive,
                ]}
              >
                College Email (Instant)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActiveTab('id_card');
                setError(undefined);
              }}
              style={[styles.methodTab, activeTab === 'id_card' && styles.methodTabActive]}
            >
              <Ionicons
                name="card-outline"
                size={16}
                color={activeTab === 'id_card' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.methodTabText,
                  activeTab === 'id_card' && styles.methodTabTextActive,
                ]}
              >
                Student ID Card
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {activeTab === 'email_otp' ? (
              /* Method 1: Institutional Email OTP */
              <View>
                <Text style={styles.methodHeader}>Verify via College Email</Text>
                <Text style={styles.methodDesc}>
                  We will send a 6-digit confirmation code to your institutional address:
                </Text>
                <View style={styles.emailPill}>
                  <Ionicons name="school" size={14} color={colors.primary} />
                  <Text style={styles.emailPillText}>{targetEmail}</Text>
                </View>

                {!otpSent ? (
                  <AppButton
                    title="Send Verification Code"
                    variant="primary"
                    size="md"
                    onPress={handleSendOtp}
                    fullWidth
                    style={{ marginTop: spacing.md }}
                  />
                ) : (
                  <View style={{ marginTop: spacing.md }}>
                    <AppTextInput
                      label="6-Digit Verification Code"
                      placeholder="Enter code (Demo test code: 123456)"
                      value={otpCode}
                      onChangeText={(c) => {
                        setOtpCode(c);
                        if (error) setError(undefined);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon="key-outline"
                      helperText="[MOCK VERIFICATION]: Use test code 123456 for simulated success"
                    />

                    <AppButton
                      title="Verify Student Affiliation"
                      variant="primary"
                      size="lg"
                      loading={isLoading}
                      onPress={handleVerifyOtp}
                      fullWidth
                      style={{ marginTop: spacing.xs }}
                    />

                    <TouchableOpacity onPress={handleSendOtp} style={styles.resendBtn}>
                      <Text style={styles.resendText}>Resend code</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              /* Method 2: Student ID Card Document Submission */
              <View>
                <Text style={styles.methodHeader}>Upload Student Identity Card</Text>
                <Text style={styles.methodDesc}>
                  If you don't have an institutional .edu email, upload a photo or scan of your current college ID card:
                </Text>

                {idFileName ? (
                  <View style={styles.fileSelectedBox}>
                    <Ionicons name="document-attach" size={24} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName}>{idFileName}</Text>
                      <Text style={styles.fileStatus}>Ready to submit for moderation review</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIdFileName(null)}>
                      <Ionicons name="close-circle" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleSelectIdFile}
                    activeOpacity={0.8}
                    style={styles.uploadArea}
                  >
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                    <Text style={styles.uploadAreaTitle}>Tap to select College ID scan / PDF</Text>
                    <Text style={styles.uploadAreaSub}>Accepted formats: PNG, JPG, PDF</Text>
                  </TouchableOpacity>
                )}

                <AppButton
                  title="Submit ID for Student Review"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  onPress={handleSubmitId}
                  fullWidth
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            )}

            {/* Strict Transparency Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.disclaimerText}>
                <Text style={{ fontWeight: 'bold' }}>Safety Policy:</Text> Unverified accounts can browse but cannot post marketplace listings or request pick-up errands.
              </Text>
            </View>
          </View>

          {/* Browse Only / Skip Option */}
          <View style={styles.skipSection}>
            <TouchableOpacity onPress={() => navigation.replace('MainApp')}>
              <Text style={styles.skipLink}>Skip for now (Browse Only mode)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  stepBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  stepBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.textSecondary,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  methodSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  methodTabActive: {
    backgroundColor: colors.primaryLight,
  },
  methodTabText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  methodTabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  successText: {
    fontSize: typography.fontSizes.xs,
    color: colors.success,
    flex: 1,
    fontWeight: typography.fontWeights.medium,
  },
  methodHeader: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  methodDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  emailPillText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
  },
  uploadArea: {
    height: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  uploadAreaTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  uploadAreaSub: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textMuted,
    marginTop: 2,
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  fileName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  fileStatus: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.warning,
    fontWeight: typography.fontWeights.medium,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.xs + 2,
  },
  disclaimerText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    lineHeight: 15,
    flex: 1,
  },
  skipSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  skipLink: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
