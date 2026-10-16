import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { RootStackParamList, IconName } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/common/AppTextInput';
import { AppButton } from '../../components/common/AppButton';
import { AppBadge } from '../../components/common/AppBadge';

type EditProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

const STUDY_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  "Postgrad / Master's",
  'Ph.D. Scholar',
];

const AVATAR_OPTIONS: { icon: IconName; bg: string; label: string }[] = [
  { icon: 'school', bg: colors.primary, label: 'Academic' },
  { icon: 'code-slash', bg: '#0284C7', label: 'Tech' },
  { icon: 'flask', bg: colors.secondary, label: 'Science' },
  { icon: 'book', bg: '#D97706', label: 'Literature' },
  { icon: 'color-palette', bg: '#DB2777', label: 'Design' },
  { icon: 'fitness', bg: colors.accentDark, label: 'Athletics' },
  { icon: 'musical-notes', bg: '#7C3AED', label: 'Music' },
  { icon: 'person', bg: '#4B5563', label: 'Classic' },
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNavProp>();
  const { user, updateProfile, isLoading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [studyYear, setStudyYear] = useState(user?.studyYear || '3rd Year');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<IconName>(
    (user?.avatar as IconName) || 'school'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!college.trim()) errs.college = 'College/University is required';
    if (!department.trim()) errs.department = 'Department is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Required Information', 'Please fill in all mandatory campus profile fields.');
      return;
    }

    const res = await updateProfile({
      name: name.trim(),
      college: college.trim(),
      department: department.trim(),
      studyYear,
      hostel: hostel.trim() || undefined,
      bio: bio.trim() || undefined,
      avatar: selectedAvatar,
    });

    if (res.success) {
      Alert.alert('Profile Updated', 'Your campus profile has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Update Failed', res.error || 'Could not save profile changes.');
    }
  };

  const isVerified = user?.isVerified || false;
  const verificationStatus = user?.verificationStatus || 'unverified';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Campus Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={styles.headerSaveBtn}
        >
          <Text style={styles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Selector Section */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.currentAvatarCircle,
                {
                  backgroundColor:
                    AVATAR_OPTIONS.find((a) => a.icon === selectedAvatar)?.bg || colors.primary,
                },
              ]}
            >
              <Ionicons name={selectedAvatar} size={38} color={colors.white} />
            </View>
            <Text style={styles.avatarSectionTitle}>Choose Student Avatar</Text>
            <Text style={styles.avatarSectionSub}>Select an icon reflecting your campus focus</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarOptionsRow}
            >
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar === item.icon;
                return (
                  <TouchableOpacity
                    key={item.icon}
                    style={[
                      styles.avatarOptionItem,
                      isSelected && styles.avatarOptionItemSelected,
                    ]}
                    onPress={() => setSelectedAvatar(item.icon)}
                  >
                    <View style={[styles.avatarOptionCircle, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={20} color={colors.white} />
                    </View>
                    <Text
                      style={[
                        styles.avatarOptionLabel,
                        isSelected && styles.avatarOptionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Genuine Verification Status Banner */}
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Ionicons
                name={isVerified ? 'shield-checkmark' : 'shield-outline'}
                size={22}
                color={isVerified ? colors.accentDark : colors.warning}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.verificationTitle}>Institutional Affiliation</Text>
                <Text style={styles.verificationSub}>
                  {isVerified
                    ? 'Verified student via institutional authentication'
                    : verificationStatus === 'pending'
                    ? 'Verification document currently under review'
                    : 'Account is unverified. Verify to unlock student trust perks.'}
                </Text>
              </View>
              <AppBadge
                label={
                  isVerified
                    ? 'Verified'
                    : verificationStatus === 'pending'
                    ? 'In Review'
                    : 'Unverified'
                }
                variant={
                  isVerified
                    ? 'primary'
                    : verificationStatus === 'pending'
                    ? 'warning'
                    : 'danger'
                }
                size="sm"
              />
            </View>
            {!isVerified && (
              <TouchableOpacity
                style={styles.verifyLinkButton}
                onPress={() =>
                  navigation.navigate('CampusVerification', { email: user?.email })
                }
              >
                <Text style={styles.verifyLinkText}>
                  {verificationStatus === 'pending'
                    ? 'View Verification Progress'
                    : 'Start Campus Verification'}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Details Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeader}>Academic Details</Text>

            <AppTextInput
              label="Full Name *"
              placeholder="e.g. Alex Chen"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              leftIcon="person-outline"
            />

            <AppTextInput
              label="College or University *"
              placeholder="e.g. National Institute of Technology"
              value={college}
              onChangeText={(val) => {
                setCollege(val);
                if (errors.college) setErrors({ ...errors, college: '' });
              }}
              error={errors.college}
              leftIcon="business-outline"
            />

            <AppTextInput
              label="Department / Major *"
              placeholder="e.g. Computer Science & Engineering"
              value={department}
              onChangeText={(val) => {
                setDepartment(val);
                if (errors.department) setErrors({ ...errors, department: '' });
              }}
              error={errors.department}
              leftIcon="book-outline"
            />

            {/* Study Year Chips */}
            <View style={styles.yearContainer}>
              <Text style={styles.fieldLabel}>Current Academic Year *</Text>
              <View style={styles.yearChipsWrap}>
                {STUDY_YEARS.map((year) => {
                  const isSelected = studyYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[styles.yearChip, isSelected && styles.yearChipSelected]}
                      onPress={() => setStudyYear(year)}
                    >
                      <Text
                        style={[
                          styles.yearChipText,
                          isSelected && styles.yearChipTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionHeader}>Campus Living & Bio</Text>

            <AppTextInput
              label="Hostel / Hall & Room (Optional)"
              placeholder="e.g. Hostel 4, Room 312 or Off-Campus"
              value={hostel}
              onChangeText={setHostel}
              leftIcon="home-outline"
              helperText="Helps peers arrange convenient pickup handovers"
            />

            <AppTextInput
              label="Student Bio / Interests (Optional)"
              placeholder="e.g. CS junior • Open-source enthusiast • Coding & badminton"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              leftIcon="create-outline"
              helperText="Keep it friendly and campus-appropriate (max 200 chars)"
              maxLength={200}
            />
          </View>

          {/* Bottom Save Button */}
          <View style={styles.bottomActions}>
            <AppButton
              title="Save Profile Changes"
              variant="primary"
              loading={isLoading}
              onPress={handleSave}
              style={{ width: '100%' }}
            />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  headerSaveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerSaveText: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  currentAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  avatarSectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  avatarSectionSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  avatarOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  avatarOptionItem: {
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionItemSelected: {
    borderColor: colors.primary,
  },
  avatarOptionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarOptionLabel: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  avatarOptionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  verificationCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  verificationTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  verificationSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  verifyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 4,
  },
  verifyLinkText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.primary,
  },
  formSection: {
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  yearContainer: {
    marginBottom: spacing.sm,
  },
  yearChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  yearChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  yearChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  yearChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
  },
  bottomActions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
