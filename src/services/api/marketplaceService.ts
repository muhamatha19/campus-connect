/**
 * ============================================================================
 * [MARKETPLACE SERVICE INTERFACE — FASTAPI /marketplace CONTRACT]
 * ============================================================================
 */

import { Product } from '../../types';
import {
  ApiResponse,
  PaginatedResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
} from './types';

export interface IMarketplaceService {
  getProducts(filters?: ProductFiltersDto): Promise<ApiResponse<PaginatedResponse<Product>>>;
  getProductById(id: string): Promise<ApiResponse<Product>>;
  createProduct(data: CreateProductDto): Promise<ApiResponse<Product>>;
  updateProduct(data: UpdateProductDto): Promise<ApiResponse<Product>>;
  deleteProduct(id: string): Promise<ApiResponse<{ deleted: boolean }>>;
  toggleFavorite(productId: string): Promise<ApiResponse<{ isFavorite: boolean }>>;
  getMyListings(): Promise<ApiResponse<Product[]>>;
  getMyFavorites(): Promise<ApiResponse<Product[]>>;
}
