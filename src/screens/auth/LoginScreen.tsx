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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await login(email, password);
    if (result.success) {
      navigation.replace('MainApp');
    } else {
      setErrors({ general: result.error || 'Authentication failed. Please try again.' });
    }
  };

  const handleDemoFill = (type: 'student' | 'verified') => {
    if (type === 'student') {
      setEmail('student@university.edu');
      setPassword('campus2026');
    } else {
      setEmail('alex.chen@nit.edu');
      setPassword('securePass123');
    }
    setErrors({});
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
          {/* Top Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={28} color={colors.white} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.appName}>Campus</Text>
              <Text style={styles.appNameAccent}>Connect</Text>
            </View>
            <Text style={styles.tagline}>Your Campus. Your Community.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subText}>Sign in with your campus account</Text>

            {errors.general && (
              <View style={styles.generalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <AppTextInput
              label="Campus or Personal Email"
              placeholder="e.g. yourname@college.edu"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <AppTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Action Button */}
            <AppButton
              title="Sign In to Campus"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Quick Demo Pre-fill for reviewer testing */}
            <View style={styles.demoBox}>
              <View style={styles.demoBadge}>
                <Ionicons name="code-slash" size={12} color={colors.primary} />
                <Text style={styles.demoBadgeText}>DEVELOPMENT MOCK TEST</Text>
              </View>
              <Text style={styles.demoDesc}>
                Mock auth is active for prototyping. Tap to autofill test credentials:
              </Text>
              <View style={styles.demoActions}>
                <TouchableOpacity
                  onPress={() => handleDemoFill('student')}
                  style={styles.demoPill}
                >
                  <Text style={styles.demoPillText}>Auto-fill: Student Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Create Account Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>New to Campus Connect?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}> Create an Account</Text>
            </TouchableOpacity>
          </View>

          {/* Guest / Direct Preview Option */}
          <View style={styles.guestRow}>
            <TouchableOpacity onPress={() => navigation.replace('MainApp')}>
              <Text style={styles.guestText}>Continue as Campus Guest (Browse)</Text>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.colored,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  appNameAccent: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.primary,
    marginLeft: 3,
  },
  tagline: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
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
  welcomeText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  subText: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  generalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  generalErrorText: {
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  forgotText: {
    fontSize: typography.fontSizes.xs + 1,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  demoBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  demoBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  demoDesc: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    lineHeight: 14,
    marginBottom: spacing.xs + 2,
  },
  demoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoPill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  demoPillText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerPrompt: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  guestRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  guestText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
