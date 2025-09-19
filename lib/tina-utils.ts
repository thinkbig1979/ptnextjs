import fs from 'fs/promises';
import path from 'path';

/**
 * Utility functions for TinaCMS content management and validation
 */

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MediaValidationResult {
  isValid: boolean;
  brokenReferences: Array<{
    file: string;
    reference: string;
  }>;
  missingFiles: string[];
}

/**
 * Validates content directory structure matches TinaCMS configuration
 */
export async function validateContentStructure(): Promise<ContentValidationResult> {
  const result: ContentValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const expectedDirectories = [
    'content/categories',
    'content/vendors', 
    'content/products',
    'content/blog/categories',
    'content/blog/posts',
    'content/team',
    'content/tags',
    'content/company'
  ];

  for (const dir of expectedDirectories) {
    try {
      await fs.access(dir);
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Missing required directory: ${dir}`);
    }
  }

  return result;
}

/**
 * Validates media directory structure and organization
 */
export async function validateMediaStructure(): Promise<ContentValidationResult> {
  const result: ContentValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const expectedMediaDirectories = [
    'public/media/categories',
    'public/media/vendors',
    'public/media/products',
    'public/media/blog',
    'public/media/team',
    'public/media/company',
    'public/media/system'
  ];

  for (const dir of expectedMediaDirectories) {
    try {
      await fs.access(dir);
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Missing required media directory: ${dir}`);
    }
  }

  return result;
}

/**
 * Validates all media references in content files
 */
export async function validateMediaReferences(): Promise<MediaValidationResult> {
  const result: MediaValidationResult = {
    isValid: true,
    brokenReferences: [],
    missingFiles: []
  };

  const contentFiles = await getAllContentFiles();

  for (const file of contentFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const mediaReferences = extractMediaReferences(content);
      
      for (const ref of mediaReferences) {
        const fullPath = path.join('public', ref);
        try {
          await fs.access(fullPath);
        } catch (error) {
          result.isValid = false;
          result.brokenReferences.push({ file, reference: ref });
        }
      }
    } catch (error) {
      result.missingFiles.push(file);
    }
  }

  return result;
}

/**
 * Generates a slug from a given string following TinaCMS conventions
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Gets the appropriate media URL with fallback to placeholder
 */
export function getMediaUrl(mediaPath?: string, _fallbackType?: string): string {
  if (mediaPath && mediaPath.startsWith('/media/')) {
    return mediaPath;
  }
  
  // Placeholder SVGs removed - OptimizedImage component now uses contextual icons
  // Return empty string to let OptimizedImage handle fallback with contextual icons
  return '';
}

/**
 * Validates frontmatter structure for a given collection type
 */
export function validateFrontmatter(content: string, _collectionType: string): ContentValidationResult {
  const result: ContentValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      result.isValid = false;
      result.errors.push('Missing frontmatter');
      return result;
    }

    // Add specific validation logic for each collection type
    // This would be expanded based on the actual schema requirements
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Invalid frontmatter format: ${error}`);
  }

  return result;
}

/**
 * Helper function to get all content files
 */
async function getAllContentFiles(): Promise<string[]> {
  const files: string[] = [];
  const contentDir = 'content';
  
  async function walkDir(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walkDir(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or is inaccessible
    }
  }
  
  await walkDir(contentDir);
  return files;
}

/**
 * Extracts media references from content
 */
function extractMediaReferences(content: string): string[] {
  const mediaReferences: string[] = [];
  
  // Match image references in frontmatter and content
  const imageMatches = content.match(/\/media\/[^"'\s]+/g) || [];
  mediaReferences.push(...imageMatches);
  
  return mediaReferences;
}

/**
 * Creates directory structure if it doesn't exist
 */
export async function ensureDirectoryStructure(): Promise<void> {
  const directories = [
    'content/categories',
    'content/vendors',
    'content/products', 
    'content/blog/categories',
    'content/blog/posts',
    'content/team',
    'content/tags',
    'content/company',
    'public/media/categories/icons',
    'public/media/categories/placeholders',
    'public/media/vendors/logos',
    'public/media/vendors/images',
    'public/media/vendors/social',
    'public/media/vendors/placeholders',
    'public/media/products/placeholders',
    'public/media/products/social',
    'public/media/blog/posts',
    'public/media/blog/inline',
    'public/media/blog/social',
    'public/media/blog/placeholders',
    'public/media/team/headshots',
    'public/media/team/group',
    'public/media/team/placeholders',
    'public/media/company/logos',
    'public/media/company/social',
    'public/media/company/about',
    'public/media/company/brand',
    'public/media/system/placeholders',
    'public/media/system/icons/feature-icons',
    'public/media/system/icons/ui-icons',
    'public/media/system/icons/category-icons',
    'public/media/system/optimized'
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists or other error
    }
  }
}

/**
 * Comprehensive validation of the entire TinaCMS setup
 */
export async function validateTinaCMSSetup() {
  const results = {
    contentStructure: await validateContentStructure(),
    mediaStructure: await validateMediaStructure(),
    mediaReferences: await validateMediaReferences()
  };

  const isValid = results.contentStructure.isValid && 
                  results.mediaStructure.isValid && 
                  results.mediaReferences.isValid;

  return {
    isValid,
    results
  };
}