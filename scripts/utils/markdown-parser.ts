/**
 * Markdown Parser Utility
 *
 * Parses TinaCMS markdown files with frontmatter and content.
 * Handles collection-specific file locations and naming patterns.
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface ParsedMarkdownFile {
  data: Record<string, any>;
  content: string;
  filePath: string;
  fileName: string;
}

export interface MarkdownFileList {
  files: string[];
  count: number;
}

/**
 * Collection directory mappings
 */
const COLLECTION_DIRS: Record<string, string> = {
  vendors: 'content/vendors',
  products: 'content/products',
  categories: 'content/categories',
  tags: 'content/tags',
  yachts: 'content/yachts',
  blog: 'content/blog/posts',
  blogCategories: 'content/blog/categories',
  team: 'content/team',
  company: 'content/company',
};

/**
 * Get the directory path for a collection
 */
export function getCollectionDir(collection: string): string {
  const dir = COLLECTION_DIRS[collection];
  if (!dir) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  return path.join(process.cwd(), dir);
}

/**
 * Read all markdown files from a collection directory
 */
export async function readMarkdownFiles(collection: string): Promise<MarkdownFileList> {
  const dirPath = getCollectionDir(collection);

  try {
    await fs.access(dirPath);
  } catch {
    // Directory doesn't exist, return empty list
    return { files: [], count: 0 };
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dirPath, entry.name));

  return {
    files,
    count: files.length,
  };
}

/**
 * Parse a single markdown file with frontmatter
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdownFile> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    data,
    content,
    filePath,
    fileName: path.basename(filePath, '.md'),
  };
}

/**
 * Parse all markdown files from a collection
 */
export async function parseCollectionFiles(collection: string): Promise<ParsedMarkdownFile[]> {
  const { files } = await readMarkdownFiles(collection);
  const parsedFiles: ParsedMarkdownFile[] = [];

  for (const file of files) {
    try {
      const parsed = await parseMarkdownFile(file);
      parsedFiles.push(parsed);
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
      // Continue with other files
    }
  }

  return parsedFiles;
}

/**
 * Get markdown file counts for all collections
 */
export async function getMarkdownCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const collection of Object.keys(COLLECTION_DIRS)) {
    const { count } = await readMarkdownFiles(collection);
    counts[collection] = count;
  }

  return counts;
}

/**
 * Validate markdown file structure
 * Returns true if file has required frontmatter fields
 */
export function validateMarkdownStructure(
  parsed: ParsedMarkdownFile,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => !(field in parsed.data));

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Resolve a TinaCMS reference path to a slug
 * Example: content/categories/water-management.md → water-management
 */
export function resolveReferenceToSlug(referencePath: string): string | null {
  if (!referencePath) return null;

  // Extract filename without extension
  const parts = referencePath.split('/');
  const filename = parts[parts.length - 1];

  if (!filename || !filename.endsWith('.md')) {
    return null;
  }

  return filename.replace('.md', '');
}

/**
 * Backup markdown content before migration
 */
export async function backupMarkdownContent(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), `.migration-backup-${timestamp}`);

  await fs.mkdir(backupDir, { recursive: true });

  // Copy entire content directory
  const contentDir = path.join(process.cwd(), 'content');
  const backupContentDir = path.join(backupDir, 'content');

  await fs.cp(contentDir, backupContentDir, { recursive: true });

  console.log(`✓ Backup created: ${backupDir}`);
  return backupDir;
}
