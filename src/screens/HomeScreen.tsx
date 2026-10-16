import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import {
  CATEGORIES,
  QUICK_ACTIONS,
  CAMPUS_ACTIVITIES,
  CAMPUS_STATS,
} from '../data/demoData';
import { Category, Product, QuickActionItem, RootTabParamList, RootStackParamList } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { useChat } from '../context/ChatContext';
import { useNotifications } from '../context/NotificationsContext';

import { HeaderBar } from '../components/common/HeaderBar';
import { SearchBar } from '../components/common/SearchBar';
import { CategoryChip } from '../components/common/CategoryChip';
import { QuickActionCard } from '../components/common/QuickActionCard';
import { ProductCard } from '../components/common/ProductCard';
import { ActivityItem } from '../components/common/ActivityItem';
import { SectionHeader } from '../components/common/SectionHeader';
import { AppButton } from '../components/common/AppButton';
import { WelcomeModal } from '../components/onboarding/WelcomeModal';
import { ListingDetailModal } from '../components/marketplace/ListingDetailModal';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;
type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const stackNav = useNavigation<RootStackNavProp>();
  const { listings, isFavorite, toggleFavorite } = useMarketplace();
  const { unreadMessagesCount } = useChat();
  const { unreadCount } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products based on search and selected category
  const filteredProducts = useMemo(() => {
    return listings.filter((product) => {
      const matchesCategory =
        selectedCategory.id === 'all' ||
        product.category.toLowerCase() === selectedCategory.name.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.sellerName.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, listings]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleQuickAction = (action: QuickActionItem) => {
    switch (action.actionType) {
      case 'sell':
        navigation.navigate('Marketplace');
        break;
      case 'task':
        navigation.navigate('Tasks');
        break;
      case 'pickdrop':
        navigation.navigate('PickDrop');
        break;
    }
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleNotificationPress = () => {
    stackNav.navigate('Notifications');
  };

  const handleChatPress = () => {
    stackNav.navigate('ChatInbox');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(CATEGORIES[0]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Header Bar */}
      <HeaderBar
        onNotificationPress={handleNotificationPress}
        onChatPress={handleChatPress}
        onHelpPress={() => setWelcomeVisible(true)}
        unreadNotifications={unreadCount > 0}
        unreadChat={unreadMessagesCount > 0}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Greeting Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color={colors.accent} />
            <Text style={styles.heroBadgeText}>CAMPUS HUB ACTIVE</Text>
          </View>
          <Text style={styles.greetingTitle}>Welcome to your campus!</Text>
          <Text style={styles.tagline}>Your Campus. Your Community.</Text>

          {/* Campus Highlights Counter */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CAMPUS_STATS.activeStudents}</Text>
              <Text style={styles.statLabel}>Students Online</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CAMPUS_STATS.liveListings}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{CAMPUS_STATS.completedDeliveries}</Text>
              <Text style={styles.statLabel}>Errands Done</Text>
            </View>
          </View>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search textbooks, tech, dorm items..."
          />
        </View>

        {/* Quick Actions (Sell, Task, Pick & Drop) */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Buy, hire, or request campus courier"
          />
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                onPress={handleQuickAction}
              />
            ))}
          </View>
        </View>

        {/* Category Shortcuts */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Browse Categories"
            subtitle="Find student essentials in a tap"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                isSelected={selectedCategory.id === cat.id}
                onSelect={handleCategorySelect}
              />
            ))}
          </ScrollView>
        </View>

        {/* Filter Feedback Indicator if active */}
        {(selectedCategory.id !== 'all' || searchQuery.trim() !== '') && (
          <View style={styles.activeFilterBanner}>
            <View style={styles.activeFilterTextWrap}>
              <Ionicons name="filter" size={14} color={colors.primary} />
              <Text style={styles.activeFilterText}>
                Showing results for{' '}
                {selectedCategory.id !== 'all' ? `"${selectedCategory.name}"` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearFilters} style={styles.clearFilterBtn}>
              <Text style={styles.clearFilterText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Marketplace Products */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Featured Marketplace"
            subtitle="Verified student gear & essentials"
            actionText={`View all (${filteredProducts.length})`}
            onActionPress={() => navigation.navigate('Marketplace')}
          />

          {filteredProducts.length > 0 ? (
            <View style={styles.productsList}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductPress}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or selecting another category.
              </Text>
              <AppButton
                title="Clear Filters"
                variant="outline"
                size="sm"
                onPress={handleClearFilters}
                style={styles.emptyButton}
              />
            </View>
          )}
        </View>

        {/* Recent Campus Activities */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Recent Campus Activity"
            subtitle="What's happening across campus right now"
          />
          <View style={styles.activityList}>
            {CAMPUS_ACTIVITIES.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        {/* Onboarding Tour Prompt Card */}
        <View style={styles.tourCard}>
          <View style={styles.tourIconCircle}>
            <Ionicons name="school-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.tourContent}>
            <Text style={styles.tourTitle}>New to Campus Connect?</Text>
            <Text style={styles.tourSubtitle}>
              Take a quick 1-minute intro tour to unlock all features.
            </Text>
          </View>
          <AppButton
            title="Intro"
            variant="primary"
            size="sm"
            onPress={() => setWelcomeVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Welcome / Onboarding Modal */}
      <WelcomeModal
        visible={welcomeVisible}
        onDismiss={() => setWelcomeVisible(false)}
      />

      {/* Listing Detail Modal */}
      {selectedProduct && (
        <ListingDetailModal
          visible={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isFavorite={isFavorite(selectedProduct.id)}
          onToggleFavorite={toggleFavorite}
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
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  heroBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs + 2,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.accentDark,
    letterSpacing: 0.6,
  },
  greetingTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.fontSizes.sm + 1,
    color: colors.primary,
    fontWeight: typography.fontWeights.semiBold,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.extraBold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs - 2,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: typography.fontWeights.medium,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryScroll: {
    paddingRight: spacing.lg,
  },
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  activeFilterTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  activeFilterText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  clearFilterBtn: {
    paddingLeft: spacing.sm,
  },
  clearFilterText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  productsList: {
    marginTop: spacing.xs,
  },
  activityList: {
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.xs,
  },
  tourCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  tourIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tourContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  tourTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  tourSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
