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

type SignupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const STUDY_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupNavigationProp>();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [studyYear, setStudyYear] = useState('1st Year');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    college?: string;
    department?: string;
    terms?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = 'Campus or student email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!college.trim()) {
      newErrors.college = 'College or University name is required';
    }

    if (!department.trim()) {
      newErrors.department = 'Department / Major is required';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Campus Connect Terms & Privacy Notice';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    const result = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      college: college.trim(),
      department: department.trim(),
      studyYear,
    });

    if (result.success) {
      // Navigate to student onboarding / campus verification
      navigation.navigate('StudentOnboarding', { email, name });
    } else {
      setErrors({ general: result.error || 'Registration failed. Please try again.' });
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
              <Text style={styles.title}>Join Campus Connect</Text>
              <Text style={styles.subtitle}>Create your student marketplace profile</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {errors.general && (
              <View style={styles.generalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <AppTextInput
              label="Full Name *"
              placeholder="e.g. Alex Chen"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              autoCapitalize="words"
              leftIcon="person-outline"
              error={errors.name}
            />

            <AppTextInput
              label="College Email *"
              placeholder="e.g. yourname@university.edu"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="school-outline"
              helperText="Institutional (.edu/.ac) email recommended for quick verification"
              error={errors.email}
            />

            <AppTextInput
              label="Password *"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <AppTextInput
              label="Confirm Password *"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <AppTextInput
              label="College or University *"
              placeholder="e.g. National Institute of Technology"
              value={college}
              onChangeText={(t) => {
                setCollege(t);
                if (errors.college) setErrors({ ...errors, college: undefined });
              }}
              autoCapitalize="words"
              leftIcon="business-outline"
              error={errors.college}
            />

            <AppTextInput
              label="Department / Branch *"
              placeholder="e.g. Computer Science & Engineering"
              value={department}
              onChangeText={(t) => {
                setDepartment(t);
                if (errors.department) setErrors({ ...errors, department: undefined });
              }}
              autoCapitalize="words"
              leftIcon="book-outline"
              error={errors.department}
            />

            {/* Study Year Selector */}
            <View style={styles.yearSection}>
              <Text style={styles.sectionLabel}>Study Year *</Text>
              <View style={styles.yearChipRow}>
                {STUDY_YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setStudyYear(year)}
                    style={[styles.yearChip, studyYear === year && styles.yearChipActive]}
                  >
                    <Text style={[styles.yearText, studyYear === year && styles.yearTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Terms and Privacy Checkbox */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setAgreeTerms(!agreeTerms)}
                style={styles.checkboxTouchable}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
              </TouchableOpacity>
              <View style={styles.termsTextWrap}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => navigation.navigate('TermsPrivacy')}
                  >
                    Campus Honor Code, Terms & Privacy Notice
                  </Text>
                </Text>
              </View>
            </View>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Create Account Button */}
            <AppButton
              title="Create Student Account"
              onPress={handleSignup}
              variant="primary"
              size="lg"
              loading={isLoading}
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Already have an account */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Sign In</Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    flex: 1,
  },
  yearSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  yearChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  yearChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  yearChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  yearText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  yearTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkboxTouchable: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsTextWrap: {
    flex: 1,
  },
  termsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.danger,
    marginTop: 2,
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
  loginLink: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
});
