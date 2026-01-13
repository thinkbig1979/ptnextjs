import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

/**
 * Test Product Seed API
 * POST /api/test/products/seed
 *
 * Bulk product creation endpoint for E2E tests.
 * Only available in test/development environments for performance.
 */
interface TestProductInput {
  name: string;
  vendor: string; // Vendor ID
  description?: string;
  shortDescription?: string;
  slug?: string;
  category?: string;
  price?: number;
  published?: boolean;
}

interface SeedResponse {
  success: boolean;
  productIds?: string[];
  count?: number;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Generate URL-friendly unique slug from product name
 * Appends timestamp to ensure uniqueness for test products
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Append timestamp for uniqueness
  return `${baseSlug}-${Date.now()}`;
}

/**
 * Verify that a vendor exists in the database with retry logic
 * Handles the case where vendor was just created but transaction not yet committed
 */
async function verifyVendorExists(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  vendorId: string,
  maxRetries: number = 3,
  retryDelay: number = 500
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await payload.findByID({
        collection: 'vendors',
        id: vendorId,
      });
      if (result) {
        return true;
      }
    } catch (error) {
      // Vendor not found or other error
      if (attempt < maxRetries) {
        console.log(`[Product Seed] Vendor ${vendorId} not found on attempt ${attempt}, retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
  return false;
}

/**
 * Convert plain text to Lexical JSON format
 */
function textToLexical(text: string): object {
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
 * POST /api/test/products/seed
 * Bulk create products for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<SeedResponse>> {
  // NODE_ENV guard - only allow in test/development OR when E2E_TEST is explicitly enabled
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Ensure it's an array
    const products = Array.isArray(body) ? body : body.products || [];
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must be an array of product objects or object with products array',
        },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();
    const createdProductIds: string[] = [];
    const existingProductIds: string[] = [];
    const errors: Record<string, string> = {};

    // Create each product
    for (let i = 0; i < products.length; i++) {
      const productData = products[i] as TestProductInput;

      try {
        // Validate required fields
        if (!productData.name) {
          errors[`product_${i}`] = 'name is required';
          continue;
        }
        if (!productData.vendor) {
          errors[`product_${i}`] = 'vendor is required';
          continue;
        }

        // CRITICAL: Verify vendor exists before attempting product creation
        // This prevents "Vendor field invalid" errors when vendor isn't committed yet
        const vendorExists = await verifyVendorExists(payload, productData.vendor);
        if (!vendorExists) {
          errors[`product_${i}_${productData.name}`] = `Vendor not found: ${productData.vendor}`;
          console.warn(`[Product Seed] Vendor ${productData.vendor} not found, skipping product ${productData.name}`);
          continue;
        }

        // Generate slug if not provided
        const slug = productData.slug || generateSlug(productData.name);

        // Check if product already exists with this slug and vendor
        const existingProducts = await payload.find({
          collection: 'products',
          where: {
            and: [
              { slug: { equals: slug } },
              { vendor: { equals: productData.vendor } },
            ],
          },
          limit: 1,
        });

        if (existingProducts.docs.length > 0) {
          // Product exists - update if needed
          const existingProduct = existingProducts.docs[0];
          const updateData: Record<string, unknown> = {};

          if (productData.published !== undefined) {
            updateData.published = productData.published;
          }
          if (productData.name) {
            updateData.name = productData.name;
          }

          if (Object.keys(updateData).length > 0) {
            await payload.update({
              collection: 'products',
              id: existingProduct.id,
              data: updateData,
            });
          }

          existingProductIds.push(existingProduct.id as string);
          console.log(`[Product Seed] Product exists, updated: ${productData.name} (${slug})`);
          continue;
        }

        // Create the product
        const createdProduct = await payload.create({
          collection: 'products',
          data: {
            name: productData.name,
            slug,
            vendor: Number(productData.vendor),
            description: textToLexical(productData.description || 'Product description'),
            shortDescription: productData.shortDescription || productData.description?.slice(0, 200) || '',
            published: productData.published !== undefined ? productData.published : true,
          },
        });

        createdProductIds.push(createdProduct.id as string);
        console.log(`[Product Seed] Created product: ${productData.name} (${slug})`);
      } catch (productError) {
        const errorMessage = productError instanceof Error ? productError.message : 'Unknown error';
        errors[`product_${i}_${productData.name}`] = errorMessage;
        console.error(`Failed to create product ${productData.name}:`, productError);
      }
    }

    // Invalidate cache for newly created products
    if (createdProductIds.length > 0) {
      try {
        console.log('[Product Seed] Invalidating cache for product pages...');
        revalidatePath('/products/');
        revalidatePath('/');
        console.log('[Product Seed] Cache invalidation complete');
      } catch (cacheError) {
        console.error('[Product Seed] Cache invalidation failed:', cacheError);
      }
    }

    // Return response
    const totalProducts = createdProductIds.length + existingProductIds.length;
    const hasErrors = Object.keys(errors).length > 0;
    const allProductsAccountedFor = totalProducts === products.length;

    // Combine both created and existing product IDs
    const allProductIds = [...createdProductIds, ...existingProductIds];

    return NextResponse.json(
      {
        success: allProductsAccountedFor || createdProductIds.length > 0,
        productIds: allProductIds,
        existingProductIds: existingProductIds,
        created: createdProductIds.length,
        existing: existingProductIds.length,
        count: totalProducts,
        ...(hasErrors && { errors }),
      },
      {
        status: allProductsAccountedFor ? 200 : (hasErrors && createdProductIds.length === 0 ? 400 : 200),
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
