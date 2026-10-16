import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { TaskItem, TaskStatus, RootStackParamList } from '../../types';
import { AppBadge } from '../common/AppBadge';
import { AppButton } from '../common/AppButton';
import { useChat } from '../../context/ChatContext';
import { ReportModal } from '../trust/ReportModal';

interface TaskDetailModalProps {
  visible: boolean;
  task: TaskItem | null;
  onClose: () => void;
  isOwnedByMe?: boolean;
  isAcceptedByMe?: boolean;
  onAccept?: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; error?: string }>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
  isOwnedByMe = false,
  isAcceptedByMe = false,
  onAccept,
  onUpdateStatus,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getOrCreateConversation } = useChat();
  const [reportVisible, setReportVisible] = React.useState(false);

  if (!task) return null;

  const handleAcceptPress = () => {
    Alert.alert(
      'Accept Campus Task?',
      `Are you ready to take on this errand for ${task.requesterName}?\nReward: ${task.reward > 0 ? `₹${task.reward}` : 'Volunteer'}\nDeadline: ${task.deadline}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Task',
          onPress: async () => {
            if (!onAccept) return;
            const res = await onAccept(task.id);
            if (res.success) {
              Alert.alert('Task Accepted!', 'You are now assigned to this task. Coordinate via campus chat.');
              onClose();
            } else {
              Alert.alert('Notice', res.error || 'Could not accept task.');
            }
          },
        },
      ]
    );
  };

  const handleStartTask = async () => {
    if (!onUpdateStatus) return;
    const res = await onUpdateStatus(task.id, 'In Progress');
    if (res.success) {
      Alert.alert('Status Updated', 'Task marked as In Progress. Safe travels across campus!');
    } else {
      Alert.alert('Notice', res.error || 'Could not update status.');
    }
  };

  const handleCompletePress = () => {
    Alert.alert(
      'Confirm Completion',
      'Has the item or errand been safely delivered and confirmed by the student requester?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Completed',
          onPress: async () => {
            if (!onUpdateStatus) return;
            const res = await onUpdateStatus(task.id, 'Completed');
            if (res.success) {
              Alert.alert('Task Completed!', 'Great job! Campus karma points have been credited to your profile.');
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleCancelPress = () => {
    Alert.alert(
      'Cancel Task?',
      'Are you sure you want to cancel this campus task? It will be marked as Cancelled.',
      [
        { text: 'Back', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!onUpdateStatus) return;
            const res = await onUpdateStatus(task.id, 'Cancelled');
            if (res.success) {
              Alert.alert('Task Cancelled', 'The task has been cancelled.');
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleCancelAcceptance = () => {
    Alert.alert(
      'Drop Task Assignment?',
      'Are you sure you want to release this task back to Open status for other students?',
      [
        { text: 'Keep Assignment', style: 'cancel' },
        {
          text: 'Drop Task',
          style: 'destructive',
          onPress: async () => {
            if (!onUpdateStatus) return;
            const res = await onUpdateStatus(task.id, 'Open');
            if (res.success) {
              Alert.alert('Assignment Released', 'The task is now Open again for campus peers.');
              onClose();
            }
          },
        },
      ]
    );
  };

  const handleContactPress = async (targetName: string) => {
    onClose();
    const peerId = isOwnedByMe ? (task.acceptedById || 'usr_peer') : task.requesterId;
    const convId = await getOrCreateConversation({
      peerId,
      peerName: targetName,
      peerDepartment: 'Campus Peer',
      peerVerified: true,
      topicType: 'Tasks',
      topicTitle: task.title,
      topicReferenceId: task.id,
    });
    navigation.navigate('ChatConversation', { conversationId: convId });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Task Details
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Progress Header */}
          <View style={styles.statusBanner}>
            <View style={styles.statusBadgeRow}>
              <AppBadge
                label={`Status: ${task.status}`}
                variant={
                  task.status === 'Completed'
                    ? 'success'
                    : task.status === 'In Progress'
                    ? 'warning'
                    : task.status === 'Accepted'
                    ? 'secondary'
                    : task.status === 'Cancelled'
                    ? 'neutral'
                    : 'accent'
                }
                size="md"
              />
              {task.urgency === 'high' && (
                <AppBadge label="Urgent Priority" variant="danger" size="md" style={{ marginLeft: 6 }} />
              )}
            </View>

            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.categorySub}>{task.category}</Text>
          </View>

          {/* Reward Card */}
          <View style={styles.rewardCard}>
            <View>
              <Text style={styles.rewardLabel}>Student Peer Reward</Text>
              <Text style={styles.rewardValue}>
                {task.reward > 0 ? `₹${task.reward}` : 'Volunteer / Academic Favor'}
              </Text>
            </View>
            <View style={styles.rewardIconBox}>
              <Ionicons name="gift-outline" size={24} color={colors.secondary} />
            </View>
          </View>

          {/* Route Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campus Route & Spots</Text>
            <View style={styles.routeCard}>
              {task.pickupLocation && (
                <View style={styles.routeRow}>
                  <View style={styles.pickupPin}>
                    <Ionicons name="radio-button-on" size={16} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeLabel}>Pick-up Location</Text>
                    <Text style={styles.routeLocation}>{task.pickupLocation}</Text>
                  </View>
                </View>
              )}

              {task.pickupLocation && <View style={styles.routeConnector} />}

              <View style={styles.routeRow}>
                <View style={styles.destPin}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>Destination / Drop-off</Text>
                  <Text style={styles.routeLocation}>{task.destinationLocation}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaLine}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaLineText}>Deadline: {task.deadline}</Text>
              </View>

              <View style={styles.metaLine}>
                <Ionicons name="chatbubbles-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaLineText}>Contact: {task.contactPreference}</Text>
              </View>
            </View>
          </View>

          {/* Detailed Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions & Notes</Text>
            <View style={styles.descCard}>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          </View>

          {/* Requester Profile Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Requester</Text>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{task.requesterName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.profileName}>{task.requesterName}</Text>
                  {task.requesterVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={colors.accent}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
                <Text style={styles.postedTime}>Posted {task.postedTime}</Text>
              </View>
              {!isOwnedByMe && (
                <AppButton
                  title="Chat"
                  variant="outline"
                  size="sm"
                  icon="chatbubble-outline"
                  onPress={() => handleContactPress(task.requesterName)}
                />
              )}
            </View>
          </View>

          {/* Assigned Helper Card if accepted */}
          {task.acceptedByName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Student Helper</Text>
              <View style={styles.profileCard}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
                  <Text style={styles.avatarLetter}>{task.acceptedByName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{task.acceptedByName}</Text>
                  <Text style={styles.postedTime}>Assigned Helper</Text>
                </View>
                {!isAcceptedByMe && (
                  <AppButton
                    title="Chat"
                    variant="outline"
                    size="sm"
                    icon="chatbubble-outline"
                    onPress={() => handleContactPress(task.acceptedByName!)}
                  />
                )}
              </View>
            </View>
          )}

          {/* Lifecycle Action Buttons */}
          <View style={styles.actionsSection}>
            {/* If task is OPEN and NOT posted by current user: Accept Button */}
            {task.status === 'Open' && !isOwnedByMe && (
              <AppButton
                title={`Accept Task • ${task.reward > 0 ? `Earn ₹${task.reward}` : 'Help Peer'}`}
                variant="secondary"
                size="lg"
                icon="checkmark-circle-outline"
                onPress={handleAcceptPress}
                fullWidth
              />
            )}

            {/* If task is ACCEPTED and user is the helper: Start or Drop */}
            {task.status === 'Accepted' && isAcceptedByMe && (
              <View style={{ gap: spacing.sm }}>
                <AppButton
                  title="Start Errand • Mark In Progress"
                  variant="primary"
                  size="lg"
                  icon="navigate-circle-outline"
                  onPress={handleStartTask}
                  fullWidth
                />
                <AppButton
                  title="Release Task Assignment"
                  variant="ghost"
                  size="md"
                  onPress={handleCancelAcceptance}
                  textStyle={{ color: colors.danger }}
                />
              </View>
            )}

            {/* If task is IN PROGRESS and user is helper or owner: Complete */}
            {task.status === 'In Progress' && (isAcceptedByMe || isOwnedByMe) && (
              <AppButton
                title="Mark Task as Completed"
                variant="accent"
                size="lg"
                icon="checkmark-done-circle-outline"
                onPress={handleCompletePress}
                fullWidth
              />
            )}

            {/* If task is OPEN or ACCEPTED and user is the owner: Cancel Task */}
            {isOwnedByMe && (task.status === 'Open' || task.status === 'Accepted') && (
              <AppButton
                title="Cancel This Task"
                variant="outline"
                size="md"
                icon="close-circle-outline"
                onPress={handleCancelPress}
                fullWidth
                style={{ marginTop: spacing.sm, borderColor: colors.danger }}
                textStyle={{ color: colors.danger }}
              />
            )}

            {!isOwnedByMe && (
              <TouchableOpacity
                style={styles.reportTaskBtn}
                onPress={() => setReportVisible(true)}
              >
                <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.reportTaskText}>Report this task</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      <ReportModal
        visible={reportVisible}
        onDismiss={() => setReportVisible(false)}
        targetType="task"
        targetId={task.id}
        targetTitle={task.title}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerIconBtn: {
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
    paddingBottom: spacing.xxxl + 20,
  },
  statusBanner: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  title: {
    fontSize: typography.fontSizes.lg + 1,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  categorySub: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeights.semiBold,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rewardLabel: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.secondaryDark,
    fontWeight: typography.fontWeights.medium,
  },
  rewardValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.secondary,
    marginTop: 2,
  },
  rewardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  routeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pickupPin: {
    marginTop: 2,
  },
  destPin: {
    marginTop: 2,
  },
  routeLabel: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  routeLocation: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 1,
  },
  routeConnector: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 7,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 4,
  },
  metaLineText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  descCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  descriptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  profileName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  postedTime: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionsSection: {
    marginTop: spacing.sm,
  },
  reportTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  reportTaskText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
