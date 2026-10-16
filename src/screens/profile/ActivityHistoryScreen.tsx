import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import {
  RootStackParamList,
  RootTabParamList,
  Product,
  TaskItem,
  PickDropRequest,
  IconName,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useTasks } from '../../context/TasksContext';
import { usePickDrop } from '../../context/PickDropContext';
import { AppBadge } from '../../components/common/AppBadge';
import { ListingDetailModal } from '../../components/marketplace/ListingDetailModal';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { RequestDetailModal } from '../../components/pickdrop/RequestDetailModal';

type ActivityHistoryRouteProp = RouteProp<RootStackParamList, 'ActivityHistory'>;
type ActivityHistoryNavProp = NativeStackNavigationProp<RootStackParamList>;
type TabNavProp = BottomTabNavigationProp<RootTabParamList>;

type ActivityTab =
  | 'timeline'
  | 'marketplace'
  | 'saved'
  | 'tasks_posted'
  | 'tasks_accepted'
  | 'pickdrop';

interface UnifiedTimelineItem {
  id: string;
  sourceType: 'marketplace' | 'saved' | 'task_posted' | 'task_accepted' | 'pickdrop';
  title: string;
  subtitle: string;
  tag: string;
  tagVariant: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger';
  icon: IconName;
  iconBg: string;
  iconColor: string;
  timestamp: string;
  rawItem: any;
}

export const ActivityHistoryScreen: React.FC = () => {
  const route = useRoute<ActivityHistoryRouteProp>();
  const navigation = useNavigation<ActivityHistoryNavProp>();
  const tabNavigation = useNavigation<TabNavProp>();
  const { user } = useAuth();

  const initialTab = route.params?.initialTab || 'timeline';
  const [activeTab, setActiveTab] = useState<ActivityTab>(initialTab);

  // Active contexts
  const { listings, favorites, isFavorite, toggleFavorite, deleteListing } = useMarketplace();
  const { tasks } = useTasks();
  const { requests, cancelRequest, acceptDelivery, advanceStatus } = usePickDrop();

  // Modals for item drill-down
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PickDropRequest | null>(null);

  // Filtered slices directly from context
  const myListings = useMemo(
    () => listings.filter((item) => item.sellerId === user?.id || item.sellerName === user?.name),
    [listings, user]
  );

  const savedListings = useMemo(
    () => listings.filter((item) => isFavorite(item.id)),
    [listings, favorites]
  );

  const tasksPosted = useMemo(
    () => tasks.filter((t) => t.requesterId === user?.id || t.requesterName === user?.name),
    [tasks, user]
  );

  const tasksAccepted = useMemo(
    () => tasks.filter((t) => t.acceptedById === user?.id || t.acceptedByName === user?.name),
    [tasks, user]
  );

  const myPickDrop = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.requesterId === user?.id ||
          r.requesterName === user?.name ||
          r.runnerId === user?.id ||
          r.runnerName === user?.name
      ),
    [requests, user]
  );

  // Unified Chronological Activity Timeline
  const unifiedTimeline: UnifiedTimelineItem[] = useMemo(() => {
    const items: UnifiedTimelineItem[] = [];

    // Marketplace
    myListings.forEach((l) => {
      items.push({
        id: `ml_${l.id}`,
        sourceType: 'marketplace',
        title: l.title,
        subtitle: `Listed for ₹${l.price} • ${l.category}`,
        tag: 'My Listing',
        tagVariant: 'primary',
        icon: 'pricetag-outline',
        iconBg: colors.primaryLight,
        iconColor: colors.primary,
        timestamp: l.createdAt || 'Recent',
        rawItem: l,
      });
    });

    // Saved
    savedListings.forEach((s) => {
      items.push({
        id: `sl_${s.id}`,
        sourceType: 'saved',
        title: s.title,
        subtitle: `Saved to wishlist • ₹${s.price}`,
        tag: 'Saved',
        tagVariant: 'secondary',
        icon: 'heart-outline',
        iconBg: '#FEE2E2',
        iconColor: colors.danger,
        timestamp: s.createdAt || 'Recent',
        rawItem: s,
      });
    });

    // Posted Tasks
    tasksPosted.forEach((tp) => {
      items.push({
        id: `tp_${tp.id}`,
        sourceType: 'task_posted',
        title: tp.title,
        subtitle: `Status: ${tp.status} • Reward: ₹${tp.reward}`,
        tag: `Task: ${tp.status}`,
        tagVariant: tp.status === 'Completed' ? 'accent' : 'warning',
        icon: 'clipboard-outline',
        iconBg: colors.secondaryLight,
        iconColor: colors.secondary,
        timestamp: tp.postedTime || 'Recent',
        rawItem: tp,
      });
    });

    // Accepted Tasks
    tasksAccepted.forEach((ta) => {
      items.push({
        id: `ta_${ta.id}`,
        sourceType: 'task_accepted',
        title: ta.title,
        subtitle: `Accepted for peer ${ta.requesterName} • ₹${ta.reward}`,
        tag: 'Accepted Task',
        tagVariant: 'accent',
        icon: 'checkmark-circle-outline',
        iconBg: colors.accentLight,
        iconColor: colors.accentDark,
        timestamp: ta.postedTime || 'Recent',
        rawItem: ta,
      });
    });

    // Pick & Drop
    myPickDrop.forEach((pd) => {
      items.push({
        id: `pd_${pd.id}`,
        sourceType: 'pickdrop',
        title: pd.itemName,
        subtitle: `${pd.pickupLocation} ➔ ${pd.dropoffLocation}`,
        tag: pd.status,
        tagVariant: pd.status === 'Delivered' ? 'accent' : 'primary',
        icon: 'bicycle-outline',
        iconBg: colors.accentLight,
        iconColor: colors.accentDark,
        timestamp: pd.timeAgo || 'Recent',
        rawItem: pd,
      });
    });

    return items;
  }, [myListings, savedListings, tasksPosted, tasksAccepted, myPickDrop]);

  const tabs: { key: ActivityTab; label: string; count?: number }[] = [
    { key: 'timeline', label: 'All Activity', count: unifiedTimeline.length },
    { key: 'marketplace', label: 'My Listings', count: myListings.length },
    { key: 'saved', label: 'Saved Wishlist', count: savedListings.length },
    { key: 'tasks_posted', label: 'Posted Tasks', count: tasksPosted.length },
    { key: 'tasks_accepted', label: 'Accepted Tasks', count: tasksAccepted.length },
    { key: 'pickdrop', label: 'Pick & Drop', count: myPickDrop.length },
  ];

  const handleItemPress = (item: UnifiedTimelineItem) => {
    switch (item.sourceType) {
      case 'marketplace':
      case 'saved':
        setSelectedProduct(item.rawItem);
        break;
      case 'task_posted':
      case 'task_accepted':
        setSelectedTask(item.rawItem);
        break;
      case 'pickdrop':
        setSelectedRequest(item.rawItem);
        break;
    }
  };

  const handleDeleteListing = (product: Product) => {
    Alert.alert('Delete Listing', `Are you sure you want to remove "${product.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteListing(product.id);
          Alert.alert('Deleted', 'Marketplace listing removed.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Activity Center</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Tabs Horizontal Scroll */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && (
                  <View
                    style={[
                      styles.tabBadge,
                      isSelected ? styles.tabBadgeActive : styles.tabBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        isSelected ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area Based on Active Tab */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <View>
            {unifiedTimeline.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="trail-sign-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Recent Campus Activity</Text>
                <Text style={styles.emptySub}>
                  When you buy, sell, post errands, or help peers, your activity feed will update
                  here.
                </Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {unifiedTimeline.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={[styles.timelineIconWrapper, { backgroundColor: item.iconBg }]}>
                      <Ionicons name={item.icon} size={18} color={item.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <AppBadge label={item.tag} variant={item.tagVariant} size="sm" />
                      </View>
                      <Text style={styles.itemSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                      <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* My Marketplace Listings Tab */}
        {activeTab === 'marketplace' && (
          <View>
            {myListings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="pricetag-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Active Listings</Text>
                <Text style={styles.emptySub}>
                  You haven't posted any books, supplies, or electronics for sale yet.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => {
                    tabNavigation.navigate('Marketplace');
                  }}
                >
                  <Text style={styles.emptyActionText}>Go to Marketplace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listCard}>
                {myListings.map((p, index) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedProduct(p)}
                  >
                    <View
                      style={[
                        styles.timelineIconWrapper,
                        { backgroundColor: p.accentColor || colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name={p.iconName || 'pricetag'}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={styles.itemPrice}>₹{p.price}</Text>
                      </View>
                      <Text style={styles.itemSubtitle}>
                        {p.category} • {p.condition}
                      </Text>
                      <Text style={styles.itemTimestamp}>{p.timeAgo || 'Recently'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteListing(p)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Saved Listings Tab */}
        {activeTab === 'saved' && (
          <View>
            {savedListings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                <Text style={styles.emptySub}>
                  Tap the heart on any item in the marketplace to save it for later.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => tabNavigation.navigate('Marketplace')}
                >
                  <Text style={styles.emptyActionText}>Browse Marketplace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listCard}>
                {savedListings.map((p, index) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedProduct(p)}
                  >
                    <View
                      style={[
                        styles.timelineIconWrapper,
                        { backgroundColor: p.accentColor || colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name={p.iconName || 'pricetag'}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={styles.itemPrice}>₹{p.price}</Text>
                      </View>
                      <Text style={styles.itemSubtitle}>
                        Seller: {p.sellerName} • {p.campusLocation}
                      </Text>
                      <Text style={styles.itemTimestamp}>{p.timeAgo || 'Recently'}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(p.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="heart" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tasks Posted Tab */}
        {activeTab === 'tasks_posted' && (
          <View>
            {tasksPosted.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Tasks Posted</Text>
                <Text style={styles.emptySub}>
                  Need notes delivered or photocopies made? Post a campus task for peers to help.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => tabNavigation.navigate('Tasks')}
                >
                  <Text style={styles.emptyActionText}>Create a Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listCard}>
                {tasksPosted.map((t, index) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTask(t)}
                  >
                    <View
                      style={[
                        styles.timelineIconWrapper,
                        { backgroundColor: colors.secondaryLight },
                      ]}
                    >
                      <Ionicons name="clipboard-outline" size={18} color={colors.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <AppBadge
                          label={t.status}
                          variant={t.status === 'Completed' ? 'accent' : 'warning'}
                          size="sm"
                        />
                      </View>
                      <Text style={styles.itemSubtitle}>
                        Reward: ₹{t.reward} • {t.destinationLocation}
                      </Text>
                      <Text style={styles.itemTimestamp}>
                        {t.acceptedByName ? `Helper: ${t.acceptedByName}` : 'Awaiting Student Helper'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tasks Accepted Tab */}
        {activeTab === 'tasks_accepted' && (
          <View>
            {tasksAccepted.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Accepted Tasks</Text>
                <Text style={styles.emptySub}>
                  You haven't accepted any peer errands yet. Earn campus karma by helping peers!
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => tabNavigation.navigate('Tasks')}
                >
                  <Text style={styles.emptyActionText}>Find Available Tasks</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listCard}>
                {tasksAccepted.map((t, index) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedTask(t)}
                  >
                    <View
                      style={[
                        styles.timelineIconWrapper,
                        { backgroundColor: colors.accentLight },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={colors.accentDark}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <AppBadge
                          label={t.status}
                          variant={t.status === 'Completed' ? 'accent' : 'warning'}
                          size="sm"
                        />
                      </View>
                      <Text style={styles.itemSubtitle}>
                        Requester: {t.requesterName} • Reward: ₹{t.reward}
                      </Text>
                      <Text style={styles.itemTimestamp}>
                        Deadline: {t.deadline} • {t.destinationLocation}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Pick & Drop Requests Tab */}
        {activeTab === 'pickdrop' && (
          <View>
            {myPickDrop.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bicycle-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Courier Errands</Text>
                <Text style={styles.emptySub}>
                  No active or past campus deliveries found. Request an errand runner anytime!
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => tabNavigation.navigate('PickDrop')}
                >
                  <Text style={styles.emptyActionText}>Request Pick & Drop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listCard}>
                {myPickDrop.map((pd, index) => (
                  <TouchableOpacity
                    key={pd.id}
                    style={[styles.timelineRow, index > 0 && styles.rowBorder]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedRequest(pd)}
                  >
                    <View
                      style={[
                        styles.timelineIconWrapper,
                        { backgroundColor: colors.accentLight },
                      ]}
                    >
                      <Ionicons name="bicycle-outline" size={18} color={colors.accentDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {pd.itemName}
                        </Text>
                        <AppBadge
                          label={pd.status}
                          variant={pd.status === 'Delivered' ? 'accent' : 'primary'}
                          size="sm"
                        />
                      </View>
                      <Text style={styles.itemSubtitle} numberOfLines={1}>
                        {pd.pickupLocation} ➔ {pd.dropoffLocation}
                      </Text>
                      <Text style={styles.itemTimestamp}>
                        {pd.runnerName ? `Runner: ${pd.runnerName}` : 'Awaiting Runner'} •{' '}
                        {pd.timeAgo || 'Recently'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Drill-down Modals */}
      {selectedProduct && (
        <ListingDetailModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => setSelectedProduct(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          visible={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          visible={!!selectedRequest}
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCancelRequest={cancelRequest}
          onAcceptDelivery={acceptDelivery}
          onAdvanceStatus={advanceStatus}
          currentUserId={user?.id || ''}
        />
      )}
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
  tabsWrapper: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.sm,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeInactive: {
    backgroundColor: colors.border,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
  },
  tabBadgeTextInactive: {
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timelineIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  itemTitle: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
  },
  itemPrice: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  itemSubtitle: {
    fontSize: typography.fontSizes.xs - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemTimestamp: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textMuted,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emptyActionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  emptyActionText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
});
