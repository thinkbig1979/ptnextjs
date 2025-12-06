/**
 * Team Member Transformer
 * Transforms Payload team member documents to the TeamMember type
 */

import type { TeamMember } from '../types';
import type { PayloadTeamMemberDocument } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';

/**
 * Transforms a Payload team member document to the TeamMember type
 *
 * @param doc - Payload team member document from database
 * @returns Transformed TeamMember object
 */
export function transformPayloadTeamMember(doc: PayloadTeamMemberDocument): TeamMember {
  return {
    id: doc.id.toString(),
    name: doc.name,
    role: doc.role,
    bio: doc.bio || '',
    image: transformMediaPath(doc.image || ''),
    email: doc.email || '',
    linkedin: doc.linkedin || '',
    order: doc.order || 999,
  };
}
