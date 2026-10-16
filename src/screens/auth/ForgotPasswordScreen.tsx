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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';

type ForgotNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotNavigationProp>();
  const { requestPasswordReset, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your college email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await requestPasswordReset(cleanEmail);
    if (result.success) {
      setSubmitted(true);
      setError(undefined);
    } else {
      setError(result.error || 'Failed to request reset instructions.');
    }
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Recover your Campus Connect access</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {submitted ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="mail-unread-outline" size={40} color={colors.success} />
                </View>
                <Text style={styles.successTitle}>Check Your Inbox</Text>
                <Text style={styles.successSubtitle}>
                  We sent password reset instructions to:
                </Text>
                <Text style={styles.emailHighlighted}>{email}</Text>
                <Text style={styles.instructionNote}>
                  [MOCK AUTH]: In production, a secure 15-minute token link will be emailed to your institutional inbox.
                </Text>

                <AppButton
                  title="Back to Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="primary"
                  size="md"
                  fullWidth
                  style={{ marginTop: spacing.lg }}
                />

                <TouchableOpacity
                  onPress={() => setSubmitted(false)}
                  style={styles.resendBtn}
                >
                  <Text style={styles.resendText}>Didn't receive email? Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.formPrompt}>
                  Enter the campus email associated with your student account. We'll send you instructions to create a new password.
                </Text>

                <AppTextInput
                  label="Registered Email *"
                  placeholder="e.g. yourname@university.edu"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) setError(undefined);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  error={error}
                />

                <AppButton
                  title="Send Reset Link"
                  onPress={handleReset}
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
          </View>

          {/* Back to Login Footer */}
          {!submitted && (
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  formPrompt: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  successSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emailHighlighted: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  instructionNote: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  resendBtn: {
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  resendText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginLink: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
});
