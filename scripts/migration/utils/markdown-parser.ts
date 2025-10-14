import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

export interface ParsedMarkdownFile {
  filename: string;
  slug: string;
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Parse a single markdown file
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdownFile> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdownContent } = matter(content);
  const filename = path.basename(filePath, '.md');

  return {
    filename,
    slug: data.slug || filename,
    frontmatter: data,
    content: markdownContent,
  };
}

/**
 * Parse all markdown files in a directory
 */
export async function parseMarkdownDirectory(dirPath: string): Promise<ParsedMarkdownFile[]> {
  const files = await fs.readdir(dirPath);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  const parsedFiles = await Promise.all(
    markdownFiles.map(file => parseMarkdownFile(path.join(dirPath, file)))
  );

  return parsedFiles;
}

/**
 * Generate slug from filename
 */
export function generateSlug(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transform media paths from TinaCMS to public URLs
 */
export function transformMediaPath(mediaPath: string): string {
  if (!mediaPath) return '';
  if (mediaPath.startsWith('http')) return mediaPath;
  if (mediaPath.startsWith('/media/')) return mediaPath;
  if (mediaPath.startsWith('/')) return mediaPath;
  return `/media/${mediaPath.replace(/^\/+/, '')}`;
}

/**
 * Resolve reference paths (e.g., content/vendors/company.md -> company)
 */
export function resolveReference(ref: string): string | null {
  if (!ref || !ref.startsWith('content/')) return null;
  const parts = ref.split('/');
  const filename = parts[parts.length - 1];
  return filename ? filename.replace('.md', '') : null;
}
