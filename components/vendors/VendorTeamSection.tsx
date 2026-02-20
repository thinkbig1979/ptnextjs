'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Linkedin } from 'lucide-react';
import type { Vendor } from '@/lib/types';

interface VendorTeamSectionProps {
  vendor: Vendor;
}

/**
 * VendorTeamSection Component
 *
 * Displays vendor team members with photos and bios
 * Available only for Tier 1+ vendors
 *
 * Features:
 * - Team member cards with photos
 * - Name, position, and bio
 * - LinkedIn links (if available)
 * - Expertise tags
 * - Responsive grid layout
 */
export function VendorTeamSection({ vendor }: VendorTeamSectionProps) {
  // Only show for Tier 1+
  if (!vendor.tier || vendor.tier === 'free') {
    return null;
  }

  const hasTeam = vendor.teamMembers && vendor.teamMembers.length > 0;

  // If no team members, don't render the section
  if (!hasTeam) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="team-section">
      <h2 className="text-2xl font-cormorant font-bold">Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendor.teamMembers?.map((member, index) => (
          <Card key={`${member.name}-${index}`} className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Photo */}
              {member.image && (
                <div className="w-24 h-24 relative rounded-full overflow-hidden">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}

              {/* Name and Position */}
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>

              {/* Bio */}
              {member.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>
              )}

              {/* LinkedIn Link */}
              {member.linkedin && (
                <div className="flex items-center justify-center pt-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

