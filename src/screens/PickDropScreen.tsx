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
import { PickDropRequest, PickDropStatus } from '../types';
import { usePickDrop, PickDropTab } from '../context/PickDropContext';
import { useAuth } from '../context/AuthContext';

import { SearchBar } from '../components/common/SearchBar';
import { AppButton } from '../components/common/AppButton';
import { PickDropCard } from '../components/pickdrop/PickDropCard';
import { CreateRequestModal } from '../components/pickdrop/CreateRequestModal';
import { RequestDetailModal } from '../components/pickdrop/RequestDetailModal';

const STATUS_FILTERS: ('All' | PickDropStatus)[] = [
  'All',
  'Requested',
  'Accepted',
  'Pickup in progress',
  'Picked up',
  'On the way',
  'Delivered',
  'Cancelled',
];

export const PickDropScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    filteredRequests,
    activeFilterTab,
    searchQuery,
    statusFilter,
    isLoading,
    createRequest,
    cancelRequest,
    acceptDelivery,
    advanceStatus,
    setActiveFilterTab,
    setSearchQuery,
    setStatusFilter,
    availableCount,
    myRequestsCount,
    myRunsCount,
    requests,
  } = usePickDrop();

  const [selectedRequest, setSelectedRequest] = useState<PickDropRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const currentUserId = user?.id || 'usr_demo_101';

  const handleCardPress = (req: PickDropRequest) => {
    setSelectedRequest(req);
    setDetailModalVisible(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  // Re-sync modal request if background update happens
  const activeDetailRequest = selectedRequest
    ? requests.find((r) => r.id === selectedRequest.id) || selectedRequest
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Campus Pick & Drop</Text>
          <Text style={styles.headerSubtitle}>Errand delivery between campus points</Text>
        </View>
        <AppButton
          title="New Request"
          variant="accent"
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
            placeholder="Search items, dorms, locations, runners..."
          />
        </View>

        {/* View Tabs: Available | My Requests | My Runs | All */}
        <View style={styles.tabSegmentsContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'available' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('available')}
          >
            <Ionicons
              name="flash-outline"
              size={13}
              color={activeFilterTab === 'available' ? colors.accentDark : colors.textSecondary}
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
            style={[styles.segmentBtn, activeFilterTab === 'my-requests' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('my-requests')}
          >
            <Ionicons
              name="paper-plane-outline"
              size={13}
              color={activeFilterTab === 'my-requests' ? colors.accentDark : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'my-requests' && styles.segmentTextActive,
              ]}
            >
              My Requests ({myRequestsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'my-runs' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('my-runs')}
          >
            <Ionicons
              name="bicycle-outline"
              size={13}
              color={activeFilterTab === 'my-runs' ? colors.accentDark : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'my-runs' && styles.segmentTextActive,
              ]}
            >
              My Runs ({myRunsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('all')}
          >
            <Ionicons
              name="grid-outline"
              size={13}
              color={activeFilterTab === 'all' ? colors.accentDark : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'all' && styles.segmentTextActive,
              ]}
            >
              All ({requests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Carousel */}
        <View style={styles.statusChipsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusChipsScroll}
          >
            {STATUS_FILTERS.map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.statusChip,
                  statusFilter === st && styles.statusChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    statusFilter === st && styles.statusChipTextActive,
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Campus Courier Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerIconWrapper}>
            <Ionicons name="bicycle" size={20} color={colors.accentDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Campus Peer Courier</Text>
            <Text style={styles.bannerDesc}>
              Students heading across campus pick up and hand over packages along their route. Fast, verified, and safe.
            </Text>
          </View>
        </View>

        {/* Requests Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.feedCountText}>
              Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'errand' : 'errands'}
            </Text>

            {(searchQuery.trim() !== '' || statusFilter !== 'All') && (
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearFiltersBtn}>
                <Ionicons name="close-circle-outline" size={14} color={colors.accentDark} />
                <Text style={styles.clearFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading campus requests...</Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bicycle-outline" size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No matching delivery requests</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || statusFilter !== 'All'
                  ? 'Try clearing your search terms or status filters.'
                  : activeFilterTab === 'my-requests'
                  ? "You haven't posted any delivery requests yet. Need something brought from across campus?"
                  : activeFilterTab === 'my-runs'
                  ? "You haven't volunteered for any runs yet. Check 'Available' to find errands along your route!"
                  : 'Be the first to request a delivery or peer errand!'}
              </Text>
              {activeFilterTab === 'my-requests' || (filteredRequests.length === 0 && !searchQuery) ? (
                <AppButton
                  title="Request Campus Runner"
                  variant="accent"
                  size="md"
                  icon="add"
                  onPress={() => setCreateModalVisible(true)}
                  style={{ marginTop: spacing.md }}
                />
              ) : (
                <AppButton
                  title="Clear Filters"
                  variant="outline"
                  size="sm"
                  onPress={handleClearFilters}
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>
          ) : (
            filteredRequests.map((req) => (
              <PickDropCard
                key={req.id}
                request={req}
                onPress={handleCardPress}
                isMyRequest={req.requesterId === currentUserId}
                isMyRun={req.runnerId === currentUserId}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Delivery Modal */}
      <CreateRequestModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={createRequest}
      />

      {/* Request Detail & Status Tracker Modal */}
      <RequestDetailModal
        visible={detailModalVisible}
        request={activeDetailRequest}
        onClose={() => setDetailModalVisible(false)}
        onCancelRequest={cancelRequest}
        onAcceptDelivery={acceptDelivery}
        onAdvanceStatus={advanceStatus}
        currentUserId={currentUserId}
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
    paddingBottom: spacing.xxxl,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  tabSegmentsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  segmentTextActive: {
    color: colors.accentDark,
    fontWeight: typography.fontWeights.bold,
  },
  statusChipsSection: {
    marginTop: spacing.sm,
  },
  statusChipsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  statusChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusChipActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentDark,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  statusChipTextActive: {
    color: colors.accentDark,
    fontWeight: typography.fontWeights.bold,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  bannerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  bannerTitle: {
    fontSize: typography.fontSizes.xs + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.accentDark,
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 11,
    color: colors.accentDark,
    lineHeight: 16,
  },
  feedSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  feedCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: typography.fontSizes.xs,
    color: colors.accentDark,
    fontWeight: typography.fontWeights.medium,
    marginLeft: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.xs,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
