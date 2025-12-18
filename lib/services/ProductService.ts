/**
 * ProductService - Product management service
 *
 * Handles product CRUD operations with ownership validation,
 * authorization, and Lexical conversion for rich text fields.
 */

import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

export interface ProductFilters {
  published?: boolean;
  category?: string;
  search?: string;
}

export interface CreateProductData {
  name: string;
  slug?: string | null;
  description: string | object;
  shortDescription?: string | null;
  images?: Array<{
    url: string;
    altText?: string | null;
    isMain?: boolean | null;
    caption?: string | null;
  }> | null;
  categories?: string[] | null;
  specifications?: Array<{
    label: string;
    value: string;
  }> | null;
  published?: boolean | null;
  tags?: string[] | null;
  price?: string | null;
  pricing?: {
    displayText?: string | null;
    subtitle?: string | null;
    showContactForm?: boolean | null;
    currency?: string | null;
  } | null;
  features?: Array<{
    title: string;
    description?: string | null;
    icon?: string | null;
    order?: number | null;
  }> | null;
  benefits?: Array<{
    benefit: string;
    icon?: string | null;
    order?: number | null;
  }> | null;
  services?: Array<{
    title: string;
    description: string;
    icon?: string | null;
    order?: number | null;
  }> | null;
  actionButtons?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'outline';
    action: 'contact' | 'quote' | 'download' | 'external_link' | 'video';
    actionData?: string | null;
    icon?: string | null;
    order?: number | null;
  }> | null;
  badges?: Array<{
    label: string;
    type: 'secondary' | 'outline' | 'success' | 'warning' | 'info';
    icon?: string | null;
    order?: number | null;
  }> | null;
  comparisonMetrics?: Array<{
    metricName: string;
    value: string;
    numericValue?: number | null;
    unit?: string | null;
    category?: 'performance' | 'physical' | 'power' | 'capacity' | 'quality' | 'environmental';
    compareHigherBetter?: boolean | null;
    industryAverage?: string | null;
  }> | null;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export class ProductService {
  /**
   * Convert plain text to Lexical JSON format
   * Required for richText fields in Payload CMS
   *
   * @param text - Plain text to convert
   * @returns Lexical JSON object
   */
  private static textToLexical(text: string): object {
    // Ensure we have valid text - Payload requires non-empty richText content
    const safeText = text && text.trim() ? text : 'Product description';

    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                text: safeText,
                version: 1,
              },
            ],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    };
  }

  /**
   * Verify that user owns the product (or is admin)
   *
   * @param productId - Product ID to verify
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Product object if authorized
   * @throws Error if product not found or unauthorized
   */
  private static async verifyOwnership(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

    // Fetch product with vendor relationship populated
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 2, // Populate vendor and vendor.user
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Authorization: Check ownership
    if (!isAdmin) {
      // Extract vendor.user ID from nested relationship
      const vendor =
        typeof product.vendor === 'object' && product.vendor !== null
          ? (product.vendor as Record<string, unknown>)
          : null;

      if (!vendor) {
        throw new Error('Product has no associated vendor');
      }

      const vendorUser =
        typeof vendor.user === 'object' && vendor.user !== null
          ? (vendor.user as Record<string, unknown>)
          : null;

      const vendorUserId = vendorUser?.id || vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only access your own products');
      }
    }

    return product;
  }

  /**
   * Get all products for a vendor
   *
   * @param vendorId - Vendor ID
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @param filters - Optional filters
   * @returns Array of products
   */
  static async getVendorProducts(
    vendorId: string,
    userId: string,
    isAdmin: boolean,
    filters?: ProductFilters
  ): Promise<Array<Record<string, unknown>>> {
    const payload = await getPayloadClient();

    // First verify the user owns this vendor (or is admin)
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Authorization check
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? (vendor.user as Record<string, unknown>).id
          : vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only access your own vendor products');
      }
    }

    // Build where clause
    const whereClause: Where = {
      vendor: {
        equals: vendorId,
      },
    };

    // Apply filters if provided
    if (filters?.published !== undefined) {
      whereClause.published = { equals: filters.published };
    }

    if (filters?.category) {
      whereClause.category = { equals: filters.category };
    }

    if (filters?.search) {
      whereClause.or = [
        {
          name: {
            contains: filters.search,
          },
        },
        {
          shortDescription: {
            contains: filters.search,
          },
        },
      ];
    }

    // Fetch products
    const result = await payload.find({
      collection: 'products',
      where: whereClause,
      limit: 100,
      sort: '-createdAt',
    });

    return result.docs;
  }

  /**
   * Get single product by ID
   *
   * @param productId - Product ID
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Product object
   */
  static async getProductById(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<Record<string, unknown>> {
    // Verify ownership will throw if not found or unauthorized
    const product = await this.verifyOwnership(productId, userId, isAdmin);
    return product;
  }

  /**
   * Create new product
   *
   * @param vendorId - Vendor ID
   * @param data - Product data
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Created product
   */
  static async createProduct(
    vendorId: string,
    data: CreateProductData,
    userId: string,
    isAdmin: boolean
  ): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

    // Verify user owns the vendor (or is admin)
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Authorization check
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? (vendor.user as Record<string, unknown>).id
          : vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only create products for your own vendor');
      }
    }

    // Prepare product data
    const productData: Record<string, unknown> = {
      vendor: vendorId,
      name: data.name,
      published: data.published !== undefined ? data.published : false,
    };

    // Auto-generate slug if not provided
    if (data.slug) {
      productData.slug = data.slug;
    } else {
      productData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Handle description - convert to Lexical if it's a string
    if (data.description) {
      if (typeof data.description === 'string') {
        productData.description = this.textToLexical(data.description);
      } else {
        productData.description = data.description;
      }
    } else {
      // Payload requires description, provide default
      productData.description = this.textToLexical('Product description');
    }

    // Optional fields
    if (data.shortDescription) {
      productData.shortDescription = data.shortDescription;
    }

    if (data.images && data.images.length > 0) {
      productData.images = data.images;
    }

    if (data.categories && data.categories.length > 0) {
      productData.categories = data.categories;
    }

    if (data.specifications && data.specifications.length > 0) {
      productData.specifications = data.specifications;
    }

    if (data.tags && data.tags.length > 0) {
      productData.tags = data.tags;
    }

    if (data.price) {
      productData.price = data.price;
    }

    if (data.pricing) {
      productData.pricing = data.pricing;
    }

    if (data.features && data.features.length > 0) {
      productData.features = data.features;
    }

    if (data.benefits && data.benefits.length > 0) {
      productData.benefits = data.benefits;
    }

    if (data.services && data.services.length > 0) {
      productData.services = data.services;
    }

    if (data.actionButtons && data.actionButtons.length > 0) {
      productData.actionButtons = data.actionButtons;
    }

    if (data.badges && data.badges.length > 0) {
      productData.badges = data.badges;
    }

    if (data.comparisonMetrics && data.comparisonMetrics.length > 0) {
      productData.comparisonMetrics = data.comparisonMetrics;
    }

    // Create product
    const product = await payload.create({
      collection: 'products',
      data: productData,
    });

    return product;
  }

  /**
   * Update existing product
   *
   * @param productId - Product ID
   * @param data - Update data
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Updated product
   */
  static async updateProduct(
    productId: string,
    data: UpdateProductData,
    userId: string,
    isAdmin: boolean
  ): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

    // Verify ownership (will throw if unauthorized)
    await this.verifyOwnership(productId, userId, isAdmin);

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Only include fields that are provided
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    if (data.description !== undefined) {
      if (typeof data.description === 'string') {
        updateData.description = this.textToLexical(data.description);
      } else {
        updateData.description = data.description;
      }
    }

    if (data.shortDescription !== undefined) {
      updateData.shortDescription = data.shortDescription;
    }

    if (data.images !== undefined) {
      updateData.images = data.images;
    }

    if (data.categories !== undefined) {
      updateData.categories = data.categories;
    }

    if (data.specifications !== undefined) {
      updateData.specifications = data.specifications;
    }

    if (data.published !== undefined) {
      updateData.published = data.published;
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.pricing !== undefined) {
      updateData.pricing = data.pricing;
    }

    if (data.features !== undefined) {
      updateData.features = data.features;
    }

    if (data.benefits !== undefined) {
      updateData.benefits = data.benefits;
    }

    if (data.services !== undefined) {
      updateData.services = data.services;
    }

    if (data.actionButtons !== undefined) {
      updateData.actionButtons = data.actionButtons;
    }

    if (data.badges !== undefined) {
      updateData.badges = data.badges;
    }

    if (data.comparisonMetrics !== undefined) {
      updateData.comparisonMetrics = data.comparisonMetrics;
    }

    // Update product
    const product = await payload.update({
      collection: 'products',
      id: productId,
      data: updateData,
    });

    return product;
  }

  /**
   * Delete product
   *
   * @param productId - Product ID
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Deletion result
   */
  static async deleteProduct(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<void> {
    const payload = await getPayloadClient();

    // Verify ownership (will throw if unauthorized)
    await this.verifyOwnership(productId, userId, isAdmin);

    // Delete product
    await payload.delete({
      collection: 'products',
      id: productId,
    });
  }

  /**
   * Toggle product publish status
   *
   * @param productId - Product ID
   * @param published - New published status
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Updated product
   */
  static async togglePublish(
    productId: string,
    published: boolean,
    userId: string,
    isAdmin: boolean
  ): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

    // Verify ownership (will throw if unauthorized)
    await this.verifyOwnership(productId, userId, isAdmin);

    // Update publish status
    const product = await payload.update({
      collection: 'products',
      id: productId,
      data: {
        published,
      },
    });

    return product;
  }
}

export default ProductService;
