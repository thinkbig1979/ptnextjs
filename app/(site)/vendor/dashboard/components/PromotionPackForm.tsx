'use client';

import { useState } from 'react';
import { Vendor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TierUpgradePrompt } from '@/components/dashboard/TierUpgradePrompt';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { TierService } from '@/lib/services/TierService';
import {
  CheckCircle2,
  Star,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  Image as ImageIcon,
  Mail,
  Info
} from 'lucide-react';

interface PromotionPackFormProps {
  vendor: Vendor;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  isAdmin?: boolean;
}

export function PromotionPackForm({ vendor, onSubmit, isAdmin = false }: PromotionPackFormProps) {
  const { updateVendor, isSaving } = useVendorDashboard();
  const [isUpdating, setIsUpdating] = useState(false);

  const tierLevel = TierService.getTierLevel(vendor.tier);
  const hasTier3Access = tierLevel >= 3;

  // Local state for admin edits
  const [promotionFeatures, setPromotionFeatures] = useState({
    featuredPlacement: vendor.promotionPack?.featuredPlacement || false,
    editorialCoverage: vendor.promotionPack?.editorialCoverage || false,
    searchHighlight: vendor.promotionPack?.searchHighlight || false,
  });

  // Show tier upgrade prompt for non-Tier 3 users
  if (!hasTier3Access) {
    return (
      <TierUpgradePrompt
        currentTier={vendor.tier || 'free'}
        requiredTier="tier3"
        featureName="Promotion Pack"
      />
    );
  }

  const handleFeatureToggle = async (feature: keyof typeof promotionFeatures) => {
    if (!isAdmin) return;

    const newValue = !promotionFeatures[feature];
    setPromotionFeatures(prev => ({ ...prev, [feature]: newValue }));

    // Auto-save for admin users
    setIsUpdating(true);
    try {
      await updateVendor({
        promotionPack: {
          ...promotionFeatures,
          [feature]: newValue,
        },
      });
    } catch (error) {
      console.error('Failed to update promotion feature:', error);
      // Revert on error
      setPromotionFeatures(prev => ({ ...prev, [feature]: !newValue }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@proptechportal.com?subject=Custom Promotion Package Inquiry';
  };

  const editorialContent = vendor.editorialContent || [];
  const hasEditorialContent = editorialContent.length > 0;

  return (
    <div className="space-y-6">
      {/* Admin Info Banner */}
      {isAdmin && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Admin Mode: You can toggle promotion features for this vendor. Changes are saved automatically.
          </AlertDescription>
        </Alert>
      )}

      {/* Promotion Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Promotion Features
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Toggle promotional features for this vendor account'
              : 'Your active promotional features and their benefits'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured Placement */}
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Checkbox
              id="featuredPlacement"
              checked={promotionFeatures.featuredPlacement}
              onCheckedChange={() => handleFeatureToggle('featuredPlacement')}
              disabled={!isAdmin || isUpdating}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="featuredPlacement"
                className="text-base font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                Featured Placement
                {promotionFeatures.featuredPlacement && (
                  <Badge variant="default" className="ml-2">Active</Badge>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                Your profile appears in premium positions on homepage and category pages,
                giving you maximum visibility to potential clients browsing the platform.
              </p>
              {!isAdmin && !promotionFeatures.featuredPlacement && (
                <p className="text-xs text-amber-600">
                  Contact our sales team to activate this feature
                </p>
              )}
            </div>
          </div>

          {/* Editorial Coverage */}
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Checkbox
              id="editorialCoverage"
              checked={promotionFeatures.editorialCoverage}
              onCheckedChange={() => handleFeatureToggle('editorialCoverage')}
              disabled={!isAdmin || isUpdating}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="editorialCoverage"
                className="text-base font-semibold flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                Editorial Coverage
                {promotionFeatures.editorialCoverage && (
                  <Badge variant="default" className="ml-2">Active</Badge>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                Platform-curated articles featuring your company, innovations, and success stories
                in our news and insights sections, building credibility and thought leadership.
              </p>
              {!isAdmin && !promotionFeatures.editorialCoverage && (
                <p className="text-xs text-amber-600">
                  Contact our sales team to activate this feature
                </p>
              )}
            </div>
          </div>

          {/* Search Highlight */}
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Checkbox
              id="searchHighlight"
              checked={promotionFeatures.searchHighlight}
              onCheckedChange={() => handleFeatureToggle('searchHighlight')}
              disabled={!isAdmin || isUpdating}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="searchHighlight"
                className="text-base font-semibold flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="h-4 w-4 text-green-500" />
                Search Highlight
                {promotionFeatures.searchHighlight && (
                  <Badge variant="default" className="ml-2">Active</Badge>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                Your listings are highlighted with special badges and appear at the top of
                relevant search results, ensuring you stand out from competitors.
              </p>
              {!isAdmin && !promotionFeatures.searchHighlight && (
                <p className="text-xs text-amber-600">
                  Contact our sales team to activate this feature
                </p>
              )}
            </div>
          </div>

          {isUpdating && (
            <p className="text-sm text-muted-foreground text-center">
              Updating promotion features...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Editorial Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Editorial Content
          </CardTitle>
          <CardDescription>
            Platform-curated articles and features about your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasEditorialContent ? (
            <div className="space-y-4">
              {editorialContent.map((article, index) => (
                <div
                  key={article.title || `editorial-${index}`}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-2">{article.title}</h4>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {article.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                        {article.images?.[0] && (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Featured Image
                          </div>
                        )}
                      </div>
                    </div>
                    {article.images?.[0] && (
                      <div className="flex-shrink-0 w-24 h-24 rounded overflow-hidden bg-muted">
                        <img
                          src={article.images?.[0]}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Platform Curated
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No editorial content yet</p>
                <p className="text-xs text-muted-foreground">
                  Contact our team to get featured in our platform editorials
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Sales CTA Section */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Custom Promotion Packages
            </CardTitle>
            <CardDescription>
              Maximize your visibility with tailored promotional solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Our sales team can create custom promotion packages that align with your business goals:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sponsored content and thought leadership articles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Targeted email campaigns to qualified leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Event sponsorship and webinar opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Social media amplification and co-marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Premium placement in industry reports and guides</span>
                </li>
              </ul>
            </div>
            <Separator />
            <Button
              onClick={handleContactSales}
              className="w-full"
              size="lg"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Sales for Custom Promotions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
