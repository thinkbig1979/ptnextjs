import {
  ProductImageSchema,
  SpecificationSchema,
  FeatureSchema,
  PricingSchema,
  CreateProductSchema,
  UpdateProductSchema,
  TogglePublishSchema,
  BulkPublishSchema,
  BulkDeleteSchema,
  type ProductImage,
  type Specification,
  type Feature,
  type Pricing,
  type CreateProductInput,
  type UpdateProductInput,
  type TogglePublishInput,
} from '../product-schema';

describe('Product Validation Schemas', () => {
  describe('ProductImageSchema', () => {
    it('should validate a valid product image', () => {
      const validImage: ProductImage = {
        url: 'https://example.com/image.jpg',
        altText: 'Product image',
        isMain: true,
        caption: 'Test caption',
      };

      const result = ProductImageSchema.safeParse(validImage);
      expect(result.success).toBe(true);
    });

    it('should accept minimal product image with just URL', () => {
      const minimalImage = {
        url: 'https://example.com/image.jpg',
      };

      const result = ProductImageSchema.safeParse(minimalImage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMain).toBe(false); // default value
      }
    });

    it('should reject invalid URL', () => {
      const invalidImage = {
        url: 'not-a-url',
      };

      const result = ProductImageSchema.safeParse(invalidImage);
      expect(result.success).toBe(false);
    });

    it('should handle empty string altText by converting to undefined', () => {
      const imageWithEmptyAlt = {
        url: 'https://example.com/image.jpg',
        altText: '',
      };

      const result = ProductImageSchema.safeParse(imageWithEmptyAlt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.altText).toBeUndefined();
      }
    });

    it('should reject altText exceeding max length', () => {
      const imageLongAlt = {
        url: 'https://example.com/image.jpg',
        altText: 'a'.repeat(256),
      };

      const result = ProductImageSchema.safeParse(imageLongAlt);
      expect(result.success).toBe(false);
    });
  });

  describe('SpecificationSchema', () => {
    it('should validate a valid specification', () => {
      const validSpec: Specification = {
        label: 'Weight',
        value: '10 kg',
      };

      const result = SpecificationSchema.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it('should reject empty label', () => {
      const invalidSpec = {
        label: '',
        value: '10 kg',
      };

      const result = SpecificationSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);
    });

    it('should reject label exceeding max length', () => {
      const invalidSpec = {
        label: 'a'.repeat(101),
        value: '10 kg',
      };

      const result = SpecificationSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);
    });

    it('should reject value exceeding max length', () => {
      const invalidSpec = {
        label: 'Weight',
        value: 'a'.repeat(501),
      };

      const result = SpecificationSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);
    });
  });

  describe('FeatureSchema', () => {
    it('should validate a complete feature', () => {
      const validFeature: Feature = {
        title: 'Advanced Navigation',
        description: 'State-of-the-art GPS navigation system',
        icon: 'navigation',
        order: 1,
      };

      const result = FeatureSchema.safeParse(validFeature);
      expect(result.success).toBe(true);
    });

    it('should accept minimal feature with just title', () => {
      const minimalFeature = {
        title: 'Basic Feature',
      };

      const result = FeatureSchema.safeParse(minimalFeature);
      expect(result.success).toBe(true);
    });

    it('should handle empty string description', () => {
      const featureEmptyDesc = {
        title: 'Feature',
        description: '',
      };

      const result = FeatureSchema.safeParse(featureEmptyDesc);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should reject title exceeding max length', () => {
      const invalidFeature = {
        title: 'a'.repeat(201),
      };

      const result = FeatureSchema.safeParse(invalidFeature);
      expect(result.success).toBe(false);
    });
  });

  describe('PricingSchema', () => {
    it('should validate complete pricing info', () => {
      const validPricing: Pricing = {
        displayText: '$50,000',
        subtitle: 'Starting price',
        showContactForm: true,
        currency: 'USD',
      };

      const result = PricingSchema.safeParse(validPricing);
      expect(result.success).toBe(true);
    });

    it('should accept empty pricing object', () => {
      const emptyPricing = {};

      const result = PricingSchema.safeParse(emptyPricing);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.showContactForm).toBe(true); // default value
      }
    });

    it('should handle empty strings by converting to undefined', () => {
      const pricingEmptyStrings = {
        displayText: '',
        subtitle: '',
        currency: '',
      };

      const result = PricingSchema.safeParse(pricingEmptyStrings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayText).toBeUndefined();
        expect(result.data.subtitle).toBeUndefined();
        expect(result.data.currency).toBeUndefined();
      }
    });
  });

  describe('CreateProductSchema', () => {
    it('should validate a complete product creation request', () => {
      const validProduct: CreateProductInput = {
        name: 'Marine Navigation System',
        description: 'Advanced GPS navigation system for superyachts',
        vendor: 'vendor-123',
        slug: 'marine-navigation-system',
        shortDescription: 'GPS navigation for yachts',
        images: [
          {
            url: 'https://example.com/image1.jpg',
            altText: 'Front view',
            isMain: true,
          },
        ],
        categories: ['cat-1', 'cat-2'],
        tags: ['tag-1', 'tag-2'],
        specifications: [
          { label: 'Weight', value: '5 kg' },
          { label: 'Dimensions', value: '30x20x10 cm' },
        ],
        features: [
          { title: 'GPS', description: 'High-precision GPS' },
        ],
        price: '$10,000',
        pricing: {
          displayText: '$10,000',
          currency: 'USD',
        },
        published: false,
      };

      const result = CreateProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should validate minimal product with only required fields', () => {
      const minimalProduct = {
        name: 'Test Product',
        description: 'Test description',
        vendor: 'vendor-123',
      };

      const result = CreateProductSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.images).toEqual([]);
        expect(result.data.published).toBe(false);
      }
    });

    it('should reject product without name', () => {
      const invalidProduct = {
        description: 'Test description',
        vendor: 'vendor-123',
      };

      const result = CreateProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should reject product without description', () => {
      const invalidProduct = {
        name: 'Test Product',
        vendor: 'vendor-123',
      };

      const result = CreateProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should reject product without vendor', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'Test description',
      };

      const result = CreateProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should reject invalid slug format', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'Test description',
        vendor: 'vendor-123',
        slug: 'Invalid Slug With Spaces',
      };

      const result = CreateProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should handle empty string slug', () => {
      const productEmptySlug = {
        name: 'Test Product',
        description: 'Test description',
        vendor: 'vendor-123',
        slug: '',
      };

      const result = CreateProductSchema.safeParse(productEmptySlug);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBeUndefined();
      }
    });
  });

  describe('UpdateProductSchema', () => {
    it('should validate partial product update', () => {
      const validUpdate: UpdateProductInput = {
        name: 'Updated Product Name',
        published: true,
      };

      const result = UpdateProductSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept empty update object', () => {
      const emptyUpdate = {};

      const result = UpdateProductSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate updating only images', () => {
      const updateImages = {
        images: [
          {
            url: 'https://example.com/new-image.jpg',
            altText: 'New image',
          },
        ],
      };

      const result = UpdateProductSchema.safeParse(updateImages);
      expect(result.success).toBe(true);
    });

    it('should validate updating specifications', () => {
      const updateSpecs = {
        specifications: [
          { label: 'New Spec', value: 'New Value' },
        ],
      };

      const result = UpdateProductSchema.safeParse(updateSpecs);
      expect(result.success).toBe(true);
    });

    it('should handle empty strings by converting to undefined', () => {
      const updateEmptyStrings = {
        name: '',
        description: '',
        slug: '',
      };

      const result = UpdateProductSchema.safeParse(updateEmptyStrings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.slug).toBeUndefined();
      }
    });

    it('should reject invalid slug format if provided', () => {
      const invalidUpdate = {
        slug: 'Invalid Slug',
      };

      const result = UpdateProductSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('TogglePublishSchema', () => {
    it('should validate publish toggle with true', () => {
      const togglePublish: TogglePublishInput = {
        published: true,
      };

      const result = TogglePublishSchema.safeParse(togglePublish);
      expect(result.success).toBe(true);
    });

    it('should validate publish toggle with false', () => {
      const toggleUnpublish: TogglePublishInput = {
        published: false,
      };

      const result = TogglePublishSchema.safeParse(toggleUnpublish);
      expect(result.success).toBe(true);
    });

    it('should reject missing published field', () => {
      const invalidToggle = {};

      const result = TogglePublishSchema.safeParse(invalidToggle);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean published value', () => {
      const invalidToggle = {
        published: 'true',
      };

      const result = TogglePublishSchema.safeParse(invalidToggle);
      expect(result.success).toBe(false);
    });
  });

  describe('BulkPublishSchema', () => {
    it('should validate bulk publish request', () => {
      const bulkPublish = {
        productIds: ['prod-1', 'prod-2', 'prod-3'],
        published: true,
      };

      const result = BulkPublishSchema.safeParse(bulkPublish);
      expect(result.success).toBe(true);
    });

    it('should reject empty productIds array', () => {
      const invalidBulk = {
        productIds: [],
        published: true,
      };

      const result = BulkPublishSchema.safeParse(invalidBulk);
      expect(result.success).toBe(false);
    });
  });

  describe('BulkDeleteSchema', () => {
    it('should validate bulk delete request', () => {
      const bulkDelete = {
        productIds: ['prod-1', 'prod-2'],
      };

      const result = BulkDeleteSchema.safeParse(bulkDelete);
      expect(result.success).toBe(true);
    });

    it('should reject empty productIds array', () => {
      const invalidBulk = {
        productIds: [],
      };

      const result = BulkDeleteSchema.safeParse(invalidBulk);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer CreateProductInput type', () => {
      const product: CreateProductInput = {
        name: 'Test',
        description: 'Test description',
        vendor: 'vendor-123',
      };

      expect(product.name).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.vendor).toBeDefined();
    });

    it('should correctly infer UpdateProductInput type', () => {
      const update: UpdateProductInput = {
        name: 'Updated name',
      };

      expect(update.name).toBeDefined();
    });

    it('should correctly infer TogglePublishInput type', () => {
      const toggle: TogglePublishInput = {
        published: true,
      };

      expect(toggle.published).toBeDefined();
    });
  });
});
