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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList, IconName } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';

type OnboardingNavProp = NativeStackNavigationProp<RootStackParamList, 'StudentOnboarding'>;
type OnboardingRouteProp = RouteProp<RootStackParamList, 'StudentOnboarding'>;

const AVATARS: { id: string; icon: IconName; label: string }[] = [
  { id: 'school', icon: 'school', label: 'Scholar' },
  { id: 'laptop', icon: 'laptop', label: 'Tech' },
  { id: 'flask', icon: 'flask', label: 'Science' },
  { id: 'brush', icon: 'brush', label: 'Design' },
  { id: 'football', icon: 'football', label: 'Sports' },
  { id: 'book', icon: 'book', label: 'Lit' },
];

export const StudentOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const route = useRoute<OnboardingRouteProp>();
  const { user, updateOnboarding, isLoading } = useAuth();

  const [hostel, setHostel] = useState(user?.hostel || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'school');

  const handleContinue = async () => {
    await updateOnboarding({
      hostel: hostel.trim() || undefined,
      bio: bio.trim() || undefined,
      avatar: selectedAvatar,
    });

    navigation.navigate('CampusVerification', { email: route.params?.email || user?.email });
  };

  const handleSkip = () => {
    navigation.replace('MainApp');
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
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 2 OF 3</Text>
            </View>
            <Text style={styles.title}>Student Profile</Text>
            <Text style={styles.subtitle}>
              Customize your campus badge. Optional details can be updated anytime in your profile.
            </Text>
          </View>

          {/* Avatar Selector Section */}
          <View style={styles.avatarSection}>
            <Text style={styles.sectionLabel}>Choose Campus Avatar (Optional)</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  onPress={() => setSelectedAvatar(av.icon)}
                  style={[
                    styles.avatarItem,
                    selectedAvatar === av.icon && styles.avatarItemActive,
                  ]}
                >
                  <Ionicons
                    name={av.icon}
                    size={24}
                    color={selectedAvatar === av.icon ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.avatarLabel,
                      selectedAvatar === av.icon && styles.avatarLabelActive,
                    ]}
                  >
                    {av.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <AppTextInput
              label="Campus Hostel / Dorm"
              isOptional
              placeholder="e.g. Hostel 4, Room 312 or Day Scholar"
              value={hostel}
              onChangeText={setHostel}
              leftIcon="home-outline"
              helperText="Helps peers arrange fast pick-up/drop-off within the same block"
            />

            <AppTextInput
              label="Student Bio / Clubs"
              isOptional
              placeholder="e.g. CS junior • Badminton club • Exam notes sharing"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              helperText="Brief summary visible on your marketplace seller card"
            />

            <AppButton
              title="Continue to Campus Verification"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              loading={isLoading}
              fullWidth
              icon="arrow-forward"
              iconPosition="right"
              style={{ marginTop: spacing.md }}
            />

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip for now • Go to Campus Home</Text>
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
    marginBottom: spacing.xl,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  stepBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
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
  avatarSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  avatarItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  avatarLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
  avatarLabelActive: {
    color: colors.white,
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
  skipBtn: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.xs,
  },
  skipBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
    textDecorationLine: 'underline',
  },
});
