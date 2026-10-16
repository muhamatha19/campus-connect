import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, MarketplaceCategory, ItemCondition, ContactPreference, IconName } from '../types';
import { INITIAL_PRODUCTS } from '../data/demoData';
import { useAuth } from './AuthContext';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — MOCK MARKETPLACE DATA LAYER]
 * ============================================================================
 * This context manages student marketplace state with local AsyncStorage caching.
 *
 * ARCHITECTURAL NOTES:
 * 1. Listings are stored locally on the device for rapid prototype testing.
 * 2. They are NOT published to a remote production database.
 * 3. Supports Create, Read, Update, Delete (CRUD), and Favouriting with offline
 *    persistence across app reloads.
 * ============================================================================
 */

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: MarketplaceCategory;
  condition: ItemCondition;
  contactPreference: ContactPreference;
  campusLocation?: string;
  imageUri?: string;
  iconName?: IconName;
  accentColor?: string;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string;
}

interface MarketplaceContextType {
  listings: Product[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: MarketplaceCategory;
  activeFilterTab: 'all' | 'favorites' | 'my-listings';
  isLoading: boolean;
  addListing: (input: CreateListingInput) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateListing: (input: UpdateListingInput) => Promise<{ success: boolean; error?: string }>;
  deleteListing: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: MarketplaceCategory) => void;
  setActiveFilterTab: (tab: 'all' | 'favorites' | 'my-listings') => void;
  resetToDemoData: () => Promise<void>;
  filteredListings: Product[];
  myListingsCount: number;
  favoritesCount: number;
}

const STORAGE_KEY_LISTINGS = '@campus_connect_listings_v2';
const STORAGE_KEY_FAVORITES = '@campus_connect_favorites_v2';

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [listings, setListings] = useState<Product[]>(INITIAL_PRODUCTS);
  const [favorites, setFavorites] = useState<string[]>(['p1', 'p3']); // Pre-favorite 2 items for demo preview
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('All');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'favorites' | 'my-listings'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedListings = await AsyncStorage.getItem(STORAGE_KEY_LISTINGS);
        const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY_FAVORITES);

        if (storedListings) {
          const parsed = JSON.parse(storedListings);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings(parsed);
          }
        } else {
          // Initialize storage with demo products
          await AsyncStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(INITIAL_PRODUCTS));
        }

        if (storedFavorites) {
          const parsedFavs = JSON.parse(storedFavorites);
          if (Array.isArray(parsedFavs)) {
            setFavorites(parsedFavs);
          }
        }
      } catch (e) {
        console.warn('[Marketplace] Error reading cached storage, using initial mock data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Sync listings to AsyncStorage
  const persistListings = async (newListings: Product[]) => {
    try {
      setListings(newListings);
      await AsyncStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(newListings));
    } catch (e) {
      console.warn('[Marketplace] Failed saving listings to storage', e);
    }
  };

  // Sync favorites to AsyncStorage
  const persistFavorites = async (newFavs: string[]) => {
    try {
      setFavorites(newFavs);
      await AsyncStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newFavs));
    } catch (e) {
      console.warn('[Marketplace] Failed saving favorites to storage', e);
    }
  };

  const getCategoryIcon = (category: MarketplaceCategory): IconName => {
    switch (category) {
      case 'Books and notes':
        return 'book-outline';
      case 'Electronics':
        return 'laptop-outline';
      case 'Lab equipment':
        return 'flask-outline';
      case 'College supplies':
        return 'briefcase-outline';
      case 'Clothing and accessories':
        return 'shirt-outline';
      case 'Other':
      default:
        return 'cube-outline';
    }
  };

  const addListing = async (
    input: CreateListingInput
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    if (!input.title.trim()) {
      return { success: false, error: 'Listing title is required.' };
    }
    if (input.price < 0 || isNaN(input.price)) {
      return { success: false, error: 'Price cannot be negative.' };
    }
    if (!input.description.trim()) {
      return { success: false, error: 'Please enter a description for the item.' };
    }

    const currentUserId = user?.id || 'usr_demo_101';
    const currentUserName = user?.name ? `${user.name} (You)` : 'You (Current Student)';
    const userLocation = user?.hostel || 'Main Campus Hub';

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      price: Math.round(Number(input.price)),
      originalPrice: input.originalPrice ? Math.round(Number(input.originalPrice)) : undefined,
      category: input.category,
      condition: input.condition,
      contactPreference: input.contactPreference,
      sellerId: currentUserId,
      sellerName: currentUserName,
      sellerRating: 5.0,
      sellerVerified: user?.isVerified || false,
      campusLocation: input.campusLocation?.trim() || userLocation,
      imageUri: input.imageUri,
      iconName: input.iconName || getCategoryIcon(input.category),
      accentColor: input.accentColor || '#EEF2FF',
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      isFeatured: false,
    };

    const updated = [newProduct, ...listings];
    await persistListings(updated);

    return { success: true, product: newProduct };
  };

  const updateListing = async (
    input: UpdateListingInput
  ): Promise<{ success: boolean; error?: string }> => {
    if (input.price !== undefined && (input.price < 0 || isNaN(input.price))) {
      return { success: false, error: 'Price cannot be negative.' };
    }

    const index = listings.findIndex((p) => p.id === input.id);
    if (index === -1) {
      return { success: false, error: 'Listing not found.' };
    }

    const existing = listings[index];
    const updatedProduct: Product = {
      ...existing,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      price: input.price !== undefined ? Math.round(Number(input.price)) : existing.price,
      originalPrice:
        input.originalPrice !== undefined
          ? Math.round(Number(input.originalPrice))
          : existing.originalPrice,
      category: input.category || existing.category,
      condition: input.condition || existing.condition,
      contactPreference: input.contactPreference || existing.contactPreference,
      campusLocation: input.campusLocation || existing.campusLocation,
      imageUri: input.imageUri !== undefined ? input.imageUri : existing.imageUri,
      iconName: input.category ? getCategoryIcon(input.category) : existing.iconName,
    };

    const updatedList = [...listings];
    updatedList[index] = updatedProduct;
    await persistListings(updatedList);

    return { success: true };
  };

  const deleteListing = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = listings.filter((p) => p.id !== id);
    await persistListings(updated);

    // Also remove from favorites if favorited
    if (favorites.includes(id)) {
      const updatedFavs = favorites.filter((favId) => favId !== id);
      await persistFavorites(updatedFavs);
    }

    return { success: true };
  };

  const toggleFavorite = (id: string) => {
    const exists = favorites.includes(id);
    const updated = exists ? favorites.filter((favId) => favId !== id) : [...favorites, id];
    persistFavorites(updated);
  };

  const isFavorite = (id: string): boolean => {
    return favorites.includes(id);
  };

  const resetToDemoData = async () => {
    await persistListings(INITIAL_PRODUCTS);
    await persistFavorites(['p1', 'p3']);
  };

  // Compute filtered listings
  const currentUserId = user?.id || 'usr_demo_101';

  const filteredListings = listings.filter((item) => {
    // 1. Tab filter (All / Saved / My Listings)
    if (activeFilterTab === 'favorites' && !favorites.includes(item.id)) {
      return false;
    }
    if (activeFilterTab === 'my-listings' && item.sellerId !== currentUserId) {
      return false;
    }

    // 2. Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // 3. Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query !== '') {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesCat = item.category.toLowerCase().includes(query);
      const matchesSeller = item.sellerName.toLowerCase().includes(query);
      const matchesLocation = item.campusLocation.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc && !matchesCat && !matchesSeller && !matchesLocation) {
        return false;
      }
    }

    return true;
  });

  const myListingsCount = listings.filter((p) => p.sellerId === currentUserId).length;
  const favoritesCount = favorites.length;

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
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
        resetToDemoData,
        filteredListings,
        myListingsCount,
        favoritesCount,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
