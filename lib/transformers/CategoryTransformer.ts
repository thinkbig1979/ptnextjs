/**
 * Category Transformer
 * Transforms Payload category documents to the Category type
 */

import type { Category } from '../types';
import type { PayloadCategoryDocument } from './PayloadTypes';

/**
 * Transforms a Payload category document to the Category type
 *
 * @param doc - Payload category document from database
 * @returns Transformed Category object
 */
export function transformCategory(doc: PayloadCategoryDocument): Category {
  return {
    id: doc.id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || '',
    icon: doc.icon || '',
    color: doc.color || '#0066cc',
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt || doc.createdAt,
  };
}
