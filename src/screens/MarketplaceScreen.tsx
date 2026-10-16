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
import { Product, MarketplaceCategory } from '../types';
import { MARKETPLACE_CATEGORIES } from '../data/demoData';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';

import { SearchBar } from '../components/common/SearchBar';
import { CategoryChip } from '../components/common/CategoryChip';
import { ProductCard } from '../components/common/ProductCard';
import { AppButton } from '../components/common/AppButton';
import { CreateEditListingModal } from '../components/marketplace/CreateEditListingModal';
import { ListingDetailModal } from '../components/marketplace/ListingDetailModal';

export const MarketplaceScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    filteredListings,
    favorites,
    searchQuery,
    selectedCategory,
    activeFilterTab,
    isLoading,
    addListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    isFavorite,
    setSearchQuery,
    setSelectedCategory,
    setActiveFilterTab,
    myListingsCount,
    favoritesCount,
  } = useMarketplace();

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const currentUserId = user?.id || 'usr_demo_101';

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setCreateModalVisible(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setCreateModalVisible(true);
  };

  const handleSaveListing = async (data: {
    id?: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: MarketplaceCategory;
    condition: any;
    contactPreference: any;
    campusLocation?: string;
    imageUri?: string;
  }) => {
    if (data.id) {
      return await updateListing({
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        condition: data.condition,
        contactPreference: data.contactPreference,
        campusLocation: data.campusLocation,
        imageUri: data.imageUri,
      });
    } else {
      return await addListing({
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        condition: data.condition,
        contactPreference: data.contactPreference,
        campusLocation: data.campusLocation,
        imageUri: data.imageUri,
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActiveFilterTab('all');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campus Marketplace</Text>
          <Text style={styles.headerSubtitle}>0% fee student-to-student exchange</Text>
        </View>
        <AppButton
          title="Sell Item"
          variant="primary"
          size="sm"
          icon="add-circle-outline"
          onPress={handleOpenCreateModal}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search textbooks, calculators, lab coats..."
          />
        </View>

        {/* View Tabs: All Listings | Saved | My Listings */}
        <View style={styles.tabSegmentsContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('all')}
          >
            <Ionicons
              name="grid-outline"
              size={14}
              color={activeFilterTab === 'all' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.segmentText, activeFilterTab === 'all' && styles.segmentTextActive]}
            >
              All Items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'favorites' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('favorites')}
          >
            <Ionicons
              name={activeFilterTab === 'favorites' ? 'heart' : 'heart-outline'}
              size={14}
              color={activeFilterTab === 'favorites' ? colors.danger : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'favorites' && styles.segmentTextActive,
              ]}
            >
              Saved ({favoritesCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeFilterTab === 'my-listings' && styles.segmentBtnActive]}
            onPress={() => setActiveFilterTab('my-listings')}
          >
            <Ionicons
              name="person-outline"
              size={14}
              color={activeFilterTab === 'my-listings' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                activeFilterTab === 'my-listings' && styles.segmentTextActive,
              ]}
            >
              My Listings ({myListingsCount})
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
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                isSelected={selectedCategory === cat.name}
                onSelect={(selected) => setSelectedCategory(selected.name as MarketplaceCategory)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Filter Feedback Banner */}
        {(selectedCategory !== 'All' || searchQuery.trim() !== '' || activeFilterTab !== 'all') && (
          <View style={styles.filterFeedbackRow}>
            <View style={styles.filterFeedbackTextWrap}>
              <Ionicons name="funnel" size={12} color={colors.primary} />
              <Text style={styles.filterFeedbackText} numberOfLines={1}>
                {activeFilterTab === 'favorites' ? 'Saved items' : activeFilterTab === 'my-listings' ? 'Your listings' : 'Filtered by'}{' '}
                {selectedCategory !== 'All' ? `"${selectedCategory}"` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearFilters} style={styles.resetFilterBtn}>
              <Text style={styles.resetFilterText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sell Promo Banner when viewing all */}
        {activeFilterTab === 'all' && searchQuery.trim() === '' && selectedCategory === 'All' && (
          <View style={styles.sellPromoCard}>
            <View style={styles.promoIconCircle}>
              <Ionicons name="pricetag" size={22} color={colors.primary} />
            </View>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Have dorm essentials to sell?</Text>
              <Text style={styles.promoSubtitle}>
                Clear your desk, pass on textbooks, and earn instant student cash.
              </Text>
            </View>
            <AppButton
              title="Post Item"
              variant="primary"
              size="sm"
              onPress={handleOpenCreateModal}
            />
          </View>
        )}

        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <Text style={styles.listingsCountTitle}>
              {activeFilterTab === 'favorites'
                ? `Saved Items (${filteredListings.length})`
                : activeFilterTab === 'my-listings'
                ? `Your Active Listings (${filteredListings.length})`
                : `${selectedCategory === 'All' ? 'Campus Listings' : selectedCategory} (${filteredListings.length})`}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading marketplace items...</Text>
            </View>
          ) : filteredListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {filteredListings.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductPress}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={toggleFavorite}
                  isOwnedByMe={product.sellerId === currentUserId}
                />
              ))}
            </View>
          ) : (
            /* Empty State */
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={
                    activeFilterTab === 'favorites'
                      ? 'heart-dislike-outline'
                      : activeFilterTab === 'my-listings'
                      ? 'pricetags-outline'
                      : 'search-outline'
                  }
                  size={40}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {activeFilterTab === 'favorites'
                  ? 'No saved items yet'
                  : activeFilterTab === 'my-listings'
                  ? 'You haven’t posted any items yet'
                  : 'No matching items found'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {activeFilterTab === 'favorites'
                  ? 'Tap the heart icon on any listing to save it to your wishlist.'
                  : activeFilterTab === 'my-listings'
                  ? 'Post textbooks, lab kits, or hostel gear to start selling directly to fellow students.'
                  : 'Try searching for different terms or reset your category filter.'}
              </Text>

              {activeFilterTab === 'my-listings' ? (
                <AppButton
                  title="Create Your First Listing"
                  variant="primary"
                  size="md"
                  icon="add-circle-outline"
                  onPress={handleOpenCreateModal}
                  style={styles.emptyBtn}
                />
              ) : (
                <AppButton
                  title="Show All Listings"
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

      {/* Floating Sell Action Button */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.88}
        onPress={handleOpenCreateModal}
        accessibilityLabel="Post New Listing"
      >
        <Ionicons name="add" size={26} color={colors.white} />
        <Text style={styles.fabText}>Sell</Text>
      </TouchableOpacity>

      {/* Create / Edit Modal */}
      <CreateEditListingModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleSaveListing}
        initialProduct={productToEdit}
      />

      {/* Listing Detail Modal */}
      <ListingDetailModal
        visible={detailModalVisible}
        product={selectedProduct}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedProduct(null);
        }}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
        isOwnedByMe={selectedProduct ? selectedProduct.sellerId === currentUserId : false}
        onEdit={handleOpenEditModal}
        onDelete={deleteListing}
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
    gap: 5,
  },
  segmentBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  segmentText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.bold,
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  filterFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.primaryLight,
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
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  resetFilterBtn: {
    paddingLeft: spacing.sm,
  },
  resetFilterText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  sellPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  promoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  promoContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  promoTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  promoSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listingsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  listingsHeader: {
    marginBottom: spacing.sm,
  },
  listingsCountTitle: {
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
  listingsGrid: {
    marginTop: spacing.xs,
  },
  emptyStateCard: {
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
    backgroundColor: colors.primaryLight,
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
    backgroundColor: colors.primary,
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
