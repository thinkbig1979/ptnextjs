/**
 * Tag Transformer
 * Transforms Payload tag documents to the Tag type
 */

import type { Tag } from '../types';
import type { PayloadTagDocument } from './PayloadTypes';

/**
 * Transforms a Payload tag document to the Tag type
 *
 * @param doc - Payload tag document from database
 * @returns Transformed Tag object
 */
export function transformTag(doc: PayloadTagDocument): Tag {
  return {
    id: doc.id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || '',
    color: doc.color || '#0066cc',
    usage_count: doc.usageCount || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt || doc.createdAt,
  };
}
