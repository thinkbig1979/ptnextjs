import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Convert plain text to Lexical JSON format
 * Required for richText fields in Payload CMS
 */
function textToLexical(text: string) {
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
              text: text,
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
 * Test Product Seed API
 * POST /api/test/products/seed
 *
 * Bulk product creation endpoint for E2E tests.
 * Only available in test/development environments for performance.
 * Bypasses validation and creates products with vendor relationships.
 */
interface TestProductInput {
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  price?: number;
  vendor?: string; // vendor ID or slug
  published?: boolean;
  specifications?: Record<string, unknown>;
}
interface SeedResponse {
  success: boolean;
  productIds?: string[];
  count?: number;
  error?: string;
  errors?: Record<string, string>;
}
/**
 * POST /api/test/products/seed
 * Bulk create products for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<SeedResponse>> {
  // NODE_ENV guard - only allow in test/development
  if (process.env.NODE_ENV === 'production') {
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
    const payload = await getPayload({ config });
    const createdProductIds: string[] = [];
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
        // Prepare product data
        const createData: any = {
          name: productData.name,
          // Convert description to Lexical format (richText field requirement)
          description: productData.description
            ? textToLexical(productData.description)
            : textToLexical(''),
          category: productData.category || 'General',
          manufacturer: productData.manufacturer,
          model: productData.model,
          price: productData.price,
          published: productData.published !== false,
        };
        // Handle vendor relationship if provided with validation
        if (productData.vendor) {
          console.log(`[Product ${i}] Validating vendor: ${productData.vendor}`);
          // Try to find vendor by ID first, then by slug
          // Note: Payload CMS relationship fields require numeric IDs
          let vendorId: number | null = null;
          try {
            // Try as direct ID
            const vendorCheck = await payload.findByID({
              collection: 'vendors',
              id: productData.vendor,
            });
            if (vendorCheck) {
              vendorId = vendorCheck.id as number;
              console.log(`[Product ${i}] Found vendor by ID: ${vendorId}`);
            }
          } catch (idError) {
            console.log(`[Product ${i}] Vendor ID lookup failed, trying slug lookup`);
            // If ID lookup fails, try by slug
            try {
              const vendorBySlug = await payload.find({
                collection: 'vendors',
                where: {
                  slug: {
                    equals: productData.vendor,
                  },
                },
              });
              if (vendorBySlug.docs && vendorBySlug.docs.length > 0) {
                vendorId = vendorBySlug.docs[0].id as number;
                console.log(`[Product ${i}] Found vendor by slug: ${vendorId}`);
              }
            } catch (slugError) {
              console.error(
                `[Product ${i}] Failed to find vendor by slug:`,
                slugError
              );
            }
          }
          if (vendorId) {
            createData.vendor = vendorId;
            console.log(`[Product ${i}] Vendor validated and assigned: ${vendorId}`);
          } else {
            console.warn(
              `[Product ${i}] Vendor "${productData.vendor}" not found in system - proceeding without vendor`
            );
          }
        }
        // Add specifications if provided
        if (productData.specifications) {
          createData.specifications = productData.specifications;
        }
        // Create product in Payload
        const createdProduct = await payload.create({
          collection: 'products',
          data: createData,
        });
        createdProductIds.push(createdProduct.id as string);
        console.log(`[Product ${i}] Successfully created: ${createdProduct.id}`);
      } catch (productError) {
        const errorMessage = productError instanceof Error ? productError.message : 'Unknown error';
        errors[`product_${i}_${productData.name}`] = errorMessage;
        console.error(`Failed to create product ${productData.name}:`, productError);
      }
    }
    // Return response
    const hasErrors = Object.keys(errors).length > 0;
    return NextResponse.json(
      {
        success: !hasErrors || createdProductIds.length > 0,
        productIds: createdProductIds,
        count: createdProductIds.length,
        ...(hasErrors && { errors }),
      },
      {
        status: hasErrors && createdProductIds.length === 0 ? 400 : 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Seed API] Fatal error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
