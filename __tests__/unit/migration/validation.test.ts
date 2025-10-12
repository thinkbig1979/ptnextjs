import {
  validateRequired,
  validateMaxLength,
  validateEmail,
  validateUrl,
  validateEnum,
  validateVendorData,
  validateProductData,
  validateCategoryData,
  validateBlogPostData,
  validateTeamMemberData,
  validateCompanyInfoData,
} from '../../../scripts/migration/utils/validation';

describe('Validation Helper Functions', () => {
  describe('validateRequired', () => {
    it('should return error for null, undefined, or empty values', () => {
      expect(validateRequired(null, 'field')).toEqual({
        field: 'field',
        message: 'field is required',
      });
      expect(validateRequired(undefined, 'field')).toEqual({
        field: 'field',
        message: 'field is required',
      });
      expect(validateRequired('', 'field')).toEqual({
        field: 'field',
        message: 'field is required',
      });
    });

    it('should return null for valid values', () => {
      expect(validateRequired('value', 'field')).toBeNull();
      expect(validateRequired(0, 'field')).toBeNull();
      expect(validateRequired(false, 'field')).toBeNull();
    });
  });

  describe('validateMaxLength', () => {
    it('should return error when value exceeds max length', () => {
      const result = validateMaxLength('a'.repeat(101), 100, 'field');
      expect(result).toEqual({
        field: 'field',
        message: 'field exceeds maximum length of 100 characters (current: 101)',
      });
    });

    it('should return null for values within max length', () => {
      expect(validateMaxLength('test', 10, 'field')).toBeNull();
      expect(validateMaxLength('a'.repeat(100), 100, 'field')).toBeNull();
    });

    it('should return null for empty or null values', () => {
      expect(validateMaxLength('', 10, 'field')).toBeNull();
      expect(validateMaxLength(null as any, 10, 'field')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return error for invalid email formats', () => {
      expect(validateEmail('invalid', 'email')).toEqual({
        field: 'email',
        message: 'email must be a valid email address',
      });
      expect(validateEmail('test@', 'email')).toEqual({
        field: 'email',
        message: 'email must be a valid email address',
      });
      expect(validateEmail('@example.com', 'email')).toEqual({
        field: 'email',
        message: 'email must be a valid email address',
      });
    });

    it('should return null for valid email formats', () => {
      expect(validateEmail('test@example.com', 'email')).toBeNull();
      expect(validateEmail('user+tag@domain.co.uk', 'email')).toBeNull();
    });

    it('should return null for empty values', () => {
      expect(validateEmail('', 'email')).toBeNull();
      expect(validateEmail(null as any, 'email')).toBeNull();
    });
  });

  describe('validateUrl', () => {
    it('should return error for invalid URLs', () => {
      expect(validateUrl('invalid-url', 'website')).toEqual({
        field: 'website',
        message: 'website must be a valid URL',
      });
      expect(validateUrl('not a url at all', 'website')).toEqual({
        field: 'website',
        message: 'website must be a valid URL',
      });
    });

    it('should return null for valid URLs', () => {
      expect(validateUrl('https://example.com', 'website')).toBeNull();
      expect(validateUrl('http://example.com/path?query=value', 'website')).toBeNull();
    });

    it('should return null for empty values', () => {
      expect(validateUrl('', 'website')).toBeNull();
      expect(validateUrl(null as any, 'website')).toBeNull();
    });
  });

  describe('validateEnum', () => {
    const options = ['free', 'tier1', 'tier2'];

    it('should return error for invalid enum values', () => {
      expect(validateEnum('invalid', options, 'tier')).toEqual({
        field: 'tier',
        message: 'tier must be one of: free, tier1, tier2',
      });
    });

    it('should return null for valid enum values', () => {
      expect(validateEnum('free', options, 'tier')).toBeNull();
      expect(validateEnum('tier1', options, 'tier')).toBeNull();
      expect(validateEnum('tier2', options, 'tier')).toBeNull();
    });

    it('should return null for empty values', () => {
      expect(validateEnum('', options, 'tier')).toBeNull();
      expect(validateEnum(null as any, options, 'tier')).toBeNull();
    });
  });
});

describe('Collection Validation Functions', () => {
  describe('validateVendorData', () => {
    const validVendor = {
      user: '123',
      tier: 'tier2',
      companyName: 'Test Company',
      slug: 'test-company',
      contactEmail: 'test@example.com',
      description: 'Test description',
      logo: '/media/logo.png',
      contactPhone: '+1234567890',
      website: 'https://example.com',
      linkedinUrl: 'https://linkedin.com/company/test',
      twitterUrl: 'https://twitter.com/test',
    };

    it('should validate correct vendor data', () => {
      const result = validateVendorData(validVendor);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require user field', () => {
      const result = validateVendorData({ ...validVendor, user: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'user')).toBe(true);
    });

    it('should require tier field', () => {
      const result = validateVendorData({ ...validVendor, tier: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'tier')).toBe(true);
    });

    it('should require companyName field', () => {
      const result = validateVendorData({ ...validVendor, companyName: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'companyName')).toBe(true);
    });

    it('should require contactEmail field', () => {
      const result = validateVendorData({ ...validVendor, contactEmail: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'contactEmail')).toBe(true);
    });

    it('should validate email format', () => {
      const result = validateVendorData({ ...validVendor, contactEmail: 'invalid-email' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'contactEmail' && e.message.includes('valid email'))).toBe(true);
    });

    it('should validate tier enum values', () => {
      const result = validateVendorData({ ...validVendor, tier: 'invalid-tier' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'tier')).toBe(true);
    });

    it('should enforce tier restrictions for free tier', () => {
      const result = validateVendorData({
        ...validVendor,
        tier: 'free',
        website: 'https://example.com',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'website' && e.message.includes('Tier 1+'))).toBe(true);
    });

    it('should validate max lengths', () => {
      const result = validateVendorData({
        ...validVendor,
        companyName: 'a'.repeat(256),
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'companyName' && e.message.includes('maximum length'))).toBe(true);
    });

    it('should validate URL formats', () => {
      const result = validateVendorData({
        ...validVendor,
        website: 'invalid-url',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'website' && e.message.includes('valid URL'))).toBe(true);
    });
  });

  describe('validateProductData', () => {
    const validProduct = {
      name: 'Test Product',
      vendor: '123',
      slug: 'test-product',
    };

    it('should validate correct product data', () => {
      const result = validateProductData(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name field', () => {
      const result = validateProductData({ ...validProduct, name: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    it('should require vendor field', () => {
      const result = validateProductData({ ...validProduct, vendor: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'vendor')).toBe(true);
    });

    it('should require slug field', () => {
      const result = validateProductData({ ...validProduct, slug: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'slug')).toBe(true);
    });

    it('should validate max lengths', () => {
      const result = validateProductData({
        ...validProduct,
        name: 'a'.repeat(256),
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name' && e.message.includes('maximum length'))).toBe(true);
    });
  });

  describe('validateCategoryData', () => {
    const validCategory = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      icon: 'anchor',
      color: '#0066cc',
    };

    it('should validate correct category data', () => {
      const result = validateCategoryData(validCategory);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name and slug', () => {
      const result = validateCategoryData({ ...validCategory, name: null, slug: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
      expect(result.errors.some(e => e.field === 'slug')).toBe(true);
    });
  });

  describe('validateBlogPostData', () => {
    const validBlogPost = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      content: 'Test content for the blog post',
      excerpt: 'Test excerpt',
    };

    it('should validate correct blog post data', () => {
      const result = validateBlogPostData(validBlogPost);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require title, slug, and content', () => {
      const result = validateBlogPostData({ ...validBlogPost, title: null, slug: null, content: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
      expect(result.errors.some(e => e.field === 'slug')).toBe(true);
      expect(result.errors.some(e => e.field === 'content')).toBe(true);
    });
  });

  describe('validateTeamMemberData', () => {
    const validTeamMember = {
      name: 'John Doe',
      role: 'CEO',
      bio: 'Test bio',
      email: 'john@example.com',
      image: '/media/team/john.jpg',
    };

    it('should validate correct team member data', () => {
      const result = validateTeamMemberData(validTeamMember);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name and role', () => {
      const result = validateTeamMemberData({ ...validTeamMember, name: null, role: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
      expect(result.errors.some(e => e.field === 'role')).toBe(true);
    });

    it('should validate email format if provided', () => {
      const result = validateTeamMemberData({ ...validTeamMember, email: 'invalid-email' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'email' && e.message.includes('valid email'))).toBe(true);
    });
  });

  describe('validateCompanyInfoData', () => {
    const validCompanyInfo = {
      name: 'Test Company',
      email: 'info@example.com',
    };

    it('should validate correct company info data', () => {
      const result = validateCompanyInfoData(validCompanyInfo);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name and email', () => {
      const result = validateCompanyInfoData({ ...validCompanyInfo, name: null, email: null });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should validate email format', () => {
      const result = validateCompanyInfoData({ ...validCompanyInfo, email: 'invalid-email' });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'email' && e.message.includes('valid email'))).toBe(true);
    });
  });
});
