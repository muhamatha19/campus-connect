import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import { TaskItem, TaskCategory, TaskStatus } from '../types';
import { TASK_CATEGORIES } from '../data/demoData';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';

import { SearchBar } from '../components/common/SearchBar';
import { TaskCard } from '../components/tasks/TaskCard';
import { AppButton } from '../components/common/AppButton';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';

const STATUS_FILTERS: ('All' | TaskStatus)[] = ['All', 'Open', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];

export const TasksScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    filteredTasks,
    activeFilterTab,
    selectedCategory,
    searchQuery,
    statusFilter,
    isLoading,
    createTask,
    acceptTask,
    updateTaskStatus,
    setActiveFilterTab,
    setSelectedCategory,
    setSearchQuery,
    setStatusFilter,
    myPostedCount,
    myAcceptedCount,
    availableCount,
  } = useTasks();

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const currentUserId = user?.id || 'usr_demo_101';

  const handleTaskPress = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStatusFilter('All');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campus Tasks</Text>
          <Text style={styles.headerSubtitle}>Peer assistance & campus errands</Text>
        </View>
        <AppButton
          title="Post Task"
          variant="secondary"
          size="sm"
          icon="add-circle-outline"
          onPress={() => setCreateModalVisible(true)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Input */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search errands, printing, pickups, supplies..."
          />
        </View>

        {/* View Tabs: Available | My Posted | My Accepted */}
        <View style={styles.tabSegmentsContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'available' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('available')}
          >
            <Ionicons
              name="flash-outline"
              size={14}
              color={activeFilterTab === 'available' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'available' && styles.segmentTextActive,
              ]}
            >
              Available ({availableCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'my-posted' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('my-posted')}
          >
            <Ionicons
              name="send-outline"
              size={14}
              color={activeFilterTab === 'my-posted' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'my-posted' && styles.segmentTextActive,
              ]}
            >
              My Posted ({myPostedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'my-accepted' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('my-accepted')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={activeFilterTab === 'my-accepted' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'my-accepted' && styles.segmentTextActive,
              ]}
            >
              Accepted ({myAcceptedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories Chip Carousel */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {TASK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat as TaskCategory)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Filter Chips (for My Posted and My Accepted) */}
        {activeFilterTab !== 'available' && (
          <View style={styles.statusFilterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
              {STATUS_FILTERS.map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatusFilter(st)}
                  style={[styles.statusChip, statusFilter === st && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, statusFilter === st && styles.statusChipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Feedback Banner */}
        {(selectedCategory !== 'All' || searchQuery.trim() !== '' || statusFilter !== 'All') && (
          <View style={styles.filterFeedbackRow}>
            <View style={styles.filterFeedbackTextWrap}>
              <Ionicons name="funnel" size={12} color={colors.secondary} />
              <Text style={styles.filterFeedbackText} numberOfLines={1}>
                Showing {selectedCategory !== 'All' ? `"${selectedCategory}"` : 'tasks'}
                {statusFilter !== 'All' ? ` • ${statusFilter}` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearFilters} style={styles.resetFilterBtn}>
              <Text style={styles.resetFilterText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksCountTitle}>
              {activeFilterTab === 'available'
                ? `Open Tasks Near You (${filteredTasks.length})`
                : activeFilterTab === 'my-posted'
                ? `Tasks You Posted (${filteredTasks.length})`
                : `Tasks You Accepted (${filteredTasks.length})`}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.secondary} />
              <Text style={styles.loadingText}>Loading campus tasks...</Text>
            </View>
          ) : filteredTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={handleTaskPress}
                  isOwnedByMe={task.requesterId === currentUserId}
                  isAcceptedByMe={task.acceptedById === currentUserId}
                />
              ))}
            </View>
          ) : (
            /* Empty State */
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={
                    activeFilterTab === 'my-accepted'
                      ? 'checkmark-done-circle-outline'
                      : activeFilterTab === 'my-posted'
                      ? 'clipboard-outline'
                      : 'search-outline'
                  }
                  size={42}
                  color={colors.secondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {activeFilterTab === 'my-accepted'
                  ? 'No accepted tasks'
                  : activeFilterTab === 'my-posted'
                  ? 'You haven’t posted any tasks yet'
                  : 'No tasks found'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {activeFilterTab === 'my-accepted'
                  ? 'Browse available campus errands and accept one to earn peer rewards.'
                  : activeFilterTab === 'my-posted'
                  ? 'Need something picked up, printed, or delivered? Post a task in under a minute.'
                  : 'Try selecting a different category or clear your search filter.'}
              </Text>

              {activeFilterTab === 'my-posted' ? (
                <AppButton
                  title="Post Your First Task"
                  variant="secondary"
                  size="md"
                  icon="add-circle-outline"
                  onPress={() => setCreateModalVisible(true)}
                  style={styles.emptyBtn}
                />
              ) : (
                <AppButton
                  title="Show All Tasks"
                  variant="outline"
                  size="sm"
                  onPress={handleClearFilters}
                  style={styles.emptyBtn}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.88}
        onPress={() => setCreateModalVisible(true)}
        accessibilityLabel="Post New Task"
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Post Task</Text>
      </TouchableOpacity>

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={createTask}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={detailModalVisible}
        task={selectedTask}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTask(null);
        }}
        isOwnedByMe={selectedTask ? selectedTask.requesterId === currentUserId : false}
        isAcceptedByMe={selectedTask ? selectedTask.acceptedById === currentUserId : false}
        onAccept={acceptTask}
        onUpdateStatus={updateTaskStatus}
      />
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
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl + 40,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabSegmentsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: colors.secondaryLight,
  },
  segmentText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  segmentTextActive: {
    color: colors.secondary,
    fontWeight: typography.fontWeights.bold,
  },
  categorySection: {
    marginBottom: spacing.xs + 2,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    gap: spacing.xs + 2,
  },
  categoryChip: {
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryDark,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  categoryChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  statusFilterSection: {
    marginBottom: spacing.sm,
  },
  statusScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  statusChip: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  statusChipTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  filterFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
  },
  filterFeedbackTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  filterFeedbackText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondaryDark,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  resetFilterBtn: {
    paddingLeft: spacing.sm,
  },
  resetFilterText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
  },
  tasksSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  tasksHeader: {
    marginBottom: spacing.sm,
  },
  tasksCountTitle: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  tasksList: {
    marginTop: spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyBtn: {
    marginTop: spacing.lg,
  },
  fabButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.colored,
    gap: 4,
  },
  fabText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
});
