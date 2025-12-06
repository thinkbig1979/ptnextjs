/**
 * Media Transformer
 * Handles transformation of media paths and Payload media documents to usable URLs
 */

interface PayloadMediaDocument {
  id: number | string;
  url?: string;
  filename?: string;
  externalUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Transforms media path from Payload CMS to a usable URL
 * Handles both string paths and Payload media relationship objects
 *
 * @param mediaPath - Media path string, Payload media document, or null/undefined
 * @returns Transformed media URL or empty string
 */
export function transformMediaPath(mediaPath: string | PayloadMediaDocument | null | undefined): string {
  if (!mediaPath) return '';

  // Handle case where mediaPath is an object (Payload media relationship)
  if (typeof mediaPath === 'object') {
    // Check for external URL first (new feature)
    if (mediaPath.externalUrl) {
      return mediaPath.externalUrl;
    }

    // Extract URL from media object (uploaded files)
    const url = mediaPath.url || mediaPath.filename || '';
    if (!url) return '';
    mediaPath = url;
  }

  // Now mediaPath should be a string
  if (typeof mediaPath !== 'string') return '';

  // Return external URLs as-is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) return mediaPath;
  if (mediaPath.startsWith('/media/')) return mediaPath;
  if (mediaPath.startsWith('/')) return mediaPath;
  return `/media/${mediaPath.replace(/^\/+/, '')}`;
}
