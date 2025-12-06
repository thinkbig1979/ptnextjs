/**
 * CompanyRepository
 *
 * Data access layer for Company and Team Member entities.
 * Handles company information and team member queries.
 */

import { BaseRepository } from './BaseRepository';
import { transformCompany, transformPayloadTeamMember } from '@/lib/transformers';
import type { CompanyInfo, TeamMember } from '@/lib/types';
import type { CacheService } from '@/lib/cache';

export class CompanyRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    const cacheKey = 'company-info';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.findGlobal({
        slug: 'company',
      });

      if (!result) {
        return null;
      }

      return transformCompany(result);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get all team members
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    const cacheKey = 'team-members';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'team',
        limit: 1000,
      });
      return result.docs.map(transformPayloadTeamMember);
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
