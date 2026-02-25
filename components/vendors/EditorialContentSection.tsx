import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Vendor, VendorEditorialContent } from '@/lib/types';

interface EditorialContentSectionProps {
  vendor: Vendor;
}

/**
 * EditorialContentSection - Displays Tier 3 vendor editorial articles
 *
 * Only renders if vendor is tier3 and has editorial content.
 */
export function EditorialContentSection({ vendor }: EditorialContentSectionProps) {
  // Only render for Tier 3 vendors with editorial content
  if (vendor.tier !== 'tier3') return null;
  if (!vendor.editorialContent || vendor.editorialContent.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-cormorant font-bold">Featured Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendor.editorialContent.map((article: VendorEditorialContent, index: number) => (
          <Card key={`editorial-${index}`}>
            <CardHeader>
              <CardTitle className="text-lg font-cormorant">{article.title}</CardTitle>
              {article.publishedAt ? (
                <p className="text-sm text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              ) : null}
            </CardHeader>
            <CardContent>
              {article.excerpt ? (
                <p className="text-muted-foreground mb-4">{article.excerpt}</p>
              ) : null}
              {article.content ? (
                <div className="prose prose-sm max-w-none">{article.content}</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
