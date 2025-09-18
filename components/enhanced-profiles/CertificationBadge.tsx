import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Certification {
  name: string;
  issuer: string;
  validUntil?: string;
  certificateUrl?: string;
  logoUrl?: string;
  isVerified: boolean;
}

// Type guard for certification validation
function isValidCertification(cert: unknown): cert is Certification {
  if (typeof cert !== 'object' || cert === null) {
    return false;
  }

  const c = cert as Certification;
  const isValidDate = (dateStr?: string) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const isValidUrl = (url?: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    typeof c.name === 'string' &&
    typeof c.issuer === 'string' &&
    typeof c.isVerified === 'boolean' &&
    c.name.length > 0 &&
    c.issuer.length > 0 &&
    isValidDate(c.validUntil) &&
    isValidUrl(c.certificateUrl) &&
    isValidUrl(c.logoUrl)
  );
}

interface CertificationBadgeProps {
  certification: Certification;
  className?: string;
}

export const CertificationBadge = React.memo(function CertificationBadge({
  certification,
  className,
}: CertificationBadgeProps) {
  const isExpired = React.useMemo(() => {
    return certification.validUntil &&
      new Date(certification.validUntil) < new Date();
  }, [certification.validUntil]);

  return (
    <Card
      data-testid="certification-badge"
      className={cn(
        "relative transition-all duration-200 hover:shadow-md",
        isExpired && "opacity-60",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {certification.logoUrl && (
            <div className="flex-shrink-0">
              <Image
                src={certification.logoUrl}
                alt={`${certification.name} logo`}
                width={48}
                height={48}
                className="rounded-md object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {certification.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {certification.issuer}
                </p>
              </div>

              {/* Verification Badge */}
              {certification.isVerified && (
                <Badge
                  data-testid="verified-badge"
                  variant="secondary"
                  className="flex items-center gap-1 text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs">Verified</span>
                </Badge>
              )}
            </div>

            {/* Validity Period */}
            {certification.validUntil && (
              <p className={cn(
                "text-xs mt-2",
                isExpired
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              )}>
                Valid until {new Date(certification.validUntil).toLocaleDateString()}
              </p>
            )}

            {/* Certificate Link */}
            {certification.certificateUrl && (
              <a
                href={certification.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View Certificate
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});