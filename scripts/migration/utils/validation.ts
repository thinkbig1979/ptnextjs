/**
 * Migration Data Validation Utility
 * Validates data against Payload CMS collection schemas before database insertion
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Helper: Validate required fields
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return null;
}

/**
 * Helper: Validate maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} exceeds maximum length of ${maxLength} characters (current: ${value.length})`,
    };
  }
  return null;
}

/**
 * Helper: Validate email format
 */
export function validateEmail(value: string, fieldName: string): ValidationError | null {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid email address`,
    };
  }
  return null;
}

/**
 * Helper: Validate URL format
 */
export function validateUrl(value: string, fieldName: string): ValidationError | null {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid URL`,
    };
  }
}

/**
 * Helper: Validate enum values
 */
export function validateEnum(
  value: string,
  options: string[],
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  if (!options.includes(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be one of: ${options.join(', ')}`,
    };
  }
  return null;
}

/**
 * Validate Vendor Data
 */
export function validateVendorData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredError = validateRequired(data.user, 'user');
  if (requiredError) errors.push(requiredError);

  const tierError = validateRequired(data.tier, 'tier');
  if (tierError) errors.push(tierError);

  const companyNameError = validateRequired(data.companyName, 'companyName');
  if (companyNameError) errors.push(companyNameError);

  const slugError = validateRequired(data.slug, 'slug');
  if (slugError) errors.push(slugError);

  const contactEmailError = validateRequired(data.contactEmail, 'contactEmail');
  if (contactEmailError) errors.push(contactEmailError);

  // Max length validations
  const companyNameLengthError = validateMaxLength(data.companyName, 255, 'companyName');
  if (companyNameLengthError) errors.push(companyNameLengthError);

  const slugLengthError = validateMaxLength(data.slug, 255, 'slug');
  if (slugLengthError) errors.push(slugLengthError);

  const descriptionLengthError = validateMaxLength(data.description, 5000, 'description');
  if (descriptionLengthError) errors.push(descriptionLengthError);

  const logoLengthError = validateMaxLength(data.logo, 500, 'logo');
  if (logoLengthError) errors.push(logoLengthError);

  const contactEmailLengthError = validateMaxLength(data.contactEmail, 255, 'contactEmail');
  if (contactEmailLengthError) errors.push(contactEmailLengthError);

  const contactPhoneLengthError = validateMaxLength(data.contactPhone, 50, 'contactPhone');
  if (contactPhoneLengthError) errors.push(contactPhoneLengthError);

  // Email format
  const emailFormatError = validateEmail(data.contactEmail, 'contactEmail');
  if (emailFormatError) errors.push(emailFormatError);

  // Enum validation
  const tierEnumError = validateEnum(data.tier, ['free', 'tier1', 'tier2'], 'tier');
  if (tierEnumError) errors.push(tierEnumError);

  // Tier restrictions
  if (data.tier === 'free') {
    const tier1Fields = ['website', 'linkedinUrl', 'twitterUrl', 'certifications'];
    tier1Fields.forEach(field => {
      if (data[field] && data[field] !== '') {
        errors.push({
          field,
          message: `${field} is only available for Tier 1+ vendors`,
        });
      }
    });
  }

  // URL validations for tier1+ fields
  if (data.website) {
    const websiteUrlError = validateUrl(data.website, 'website');
    if (websiteUrlError) errors.push(websiteUrlError);
  }

  if (data.linkedinUrl) {
    const linkedinUrlError = validateUrl(data.linkedinUrl, 'linkedinUrl');
    if (linkedinUrlError) errors.push(linkedinUrlError);
  }

  if (data.twitterUrl) {
    const twitterUrlError = validateUrl(data.twitterUrl, 'twitterUrl');
    if (twitterUrlError) errors.push(twitterUrlError);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Product Data
 */
export function validateProductData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const nameError = validateRequired(data.name, 'name');
  if (nameError) errors.push(nameError);

  const vendorError = validateRequired(data.vendor, 'vendor');
  if (vendorError) errors.push(vendorError);

  const slugError = validateRequired(data.slug, 'slug');
  if (slugError) errors.push(slugError);

  // Max length validations
  const nameLengthError = validateMaxLength(data.name, 255, 'name');
  if (nameLengthError) errors.push(nameLengthError);

  const slugLengthError = validateMaxLength(data.slug, 255, 'slug');
  if (slugLengthError) errors.push(slugLengthError);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Category Data
 */
export function validateCategoryData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const nameError = validateRequired(data.name, 'name');
  if (nameError) errors.push(nameError);

  const slugError = validateRequired(data.slug, 'slug');
  if (slugError) errors.push(slugError);

  // Max length validations
  const nameLengthError = validateMaxLength(data.name, 255, 'name');
  if (nameLengthError) errors.push(nameLengthError);

  const slugLengthError = validateMaxLength(data.slug, 255, 'slug');
  if (slugLengthError) errors.push(slugLengthError);

  const descriptionLengthError = validateMaxLength(data.description, 500, 'description');
  if (descriptionLengthError) errors.push(descriptionLengthError);

  const iconLengthError = validateMaxLength(data.icon, 100, 'icon');
  if (iconLengthError) errors.push(iconLengthError);

  const colorLengthError = validateMaxLength(data.color, 50, 'color');
  if (colorLengthError) errors.push(colorLengthError);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Blog Post Data
 */
export function validateBlogPostData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const titleError = validateRequired(data.title, 'title');
  if (titleError) errors.push(titleError);

  const slugError = validateRequired(data.slug, 'slug');
  if (slugError) errors.push(slugError);

  const contentError = validateRequired(data.content, 'content');
  if (contentError) errors.push(contentError);

  // Max length validations
  const titleLengthError = validateMaxLength(data.title, 255, 'title');
  if (titleLengthError) errors.push(titleLengthError);

  const slugLengthError = validateMaxLength(data.slug, 255, 'slug');
  if (slugLengthError) errors.push(slugLengthError);

  const excerptLengthError = validateMaxLength(data.excerpt, 500, 'excerpt');
  if (excerptLengthError) errors.push(excerptLengthError);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Team Member Data
 */
export function validateTeamMemberData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const nameError = validateRequired(data.name, 'name');
  if (nameError) errors.push(nameError);

  const roleError = validateRequired(data.role, 'role');
  if (roleError) errors.push(roleError);

  // Max length validations
  const nameLengthError = validateMaxLength(data.name, 255, 'name');
  if (nameLengthError) errors.push(nameLengthError);

  const roleLengthError = validateMaxLength(data.role, 255, 'role');
  if (roleLengthError) errors.push(roleLengthError);

  const bioLengthError = validateMaxLength(data.bio, 1000, 'bio');
  if (bioLengthError) errors.push(bioLengthError);

  const imageLengthError = validateMaxLength(data.image, 500, 'image');
  if (imageLengthError) errors.push(imageLengthError);

  const emailLengthError = validateMaxLength(data.email, 255, 'email');
  if (emailLengthError) errors.push(emailLengthError);

  // Email format
  if (data.email) {
    const emailFormatError = validateEmail(data.email, 'email');
    if (emailFormatError) errors.push(emailFormatError);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Company Info Data
 */
export function validateCompanyInfoData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  const nameError = validateRequired(data.name, 'name');
  if (nameError) errors.push(nameError);

  const emailError = validateRequired(data.email, 'email');
  if (emailError) errors.push(emailError);

  // Max length validations
  const nameLengthError = validateMaxLength(data.name, 255, 'name');
  if (nameLengthError) errors.push(nameLengthError);

  const emailLengthError = validateMaxLength(data.email, 255, 'email');
  if (emailLengthError) errors.push(emailLengthError);

  // Email format
  const emailFormatError = validateEmail(data.email, 'email');
  if (emailFormatError) errors.push(emailFormatError);

  return {
    valid: errors.length === 0,
    errors,
  };
}
