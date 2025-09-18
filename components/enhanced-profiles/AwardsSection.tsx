import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Award {
  id: string;
  title: string;
  organization: string;
  year: number;
  description: string;
  category: string;
  imageUrl?: string;
  certificateUrl?: string;
}

// Type guard for award validation
function isValidAward(award: unknown): award is Award {
  return (
    typeof award === 'object' &&
    award !== null &&
    'id' in award &&
    'title' in award &&
    'organization' in award &&
    'year' in award &&
    'description' in award &&
    'category' in award &&
    typeof (award as Award).id === 'string' &&
    typeof (award as Award).title === 'string' &&
    typeof (award as Award).organization === 'string' &&
    typeof (award as Award).year === 'number' &&
    typeof (award as Award).description === 'string' &&
    typeof (award as Award).category === 'string' &&
    ((award as Award).imageUrl === undefined || typeof (award as Award).imageUrl === 'string') &&
    ((award as Award).certificateUrl === undefined || typeof (award as Award).certificateUrl === 'string') &&
    (award as Award).year > 1900 && (award as Award).year <= new Date().getFullYear() + 1
  );
}

interface AwardsSectionProps {
  awards: Award[];
  className?: string;
}

export const AwardsSection = React.memo(function AwardsSection({ awards, className }: AwardsSectionProps) {
  const sortedAwards = React.useMemo(() => {
    return [...awards].sort((a, b) => b.year - a.year);
  }, [awards]);

  if (awards.length === 0) {
    return (
      <div
        data-testid="awards-section"
        className={cn("text-center py-8", className)}
      >
        <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No awards to display at this time.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="awards-section"
      className={cn("space-y-6", className)}
    >
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Awards & Recognition
        </h2>
      </div>

      <div className="relative">
        {/* Timeline connector */}
        <div
          data-testid="timeline-connector"
          className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"
        />

        <div className="space-y-6">
          {sortedAwards.map((award, index) => (
            <div key={award.id} className="relative flex items-start gap-6">
              {/* Timeline dot */}
              <div className="flex-shrink-0 relative z-10">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg" />
              </div>

              {/* Award card */}
              <Card className="flex-1 transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Award image */}
                    {award.imageUrl && (
                      <div className="flex-shrink-0">
                        <Image
                          src={award.imageUrl}
                          alt={award.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}

                    {/* Award content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {award.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {award.organization}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div
                            data-testid="award-year"
                            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            <Calendar className="w-4 h-4" />
                            {award.year}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {award.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {award.description}
                      </p>

                      {/* Certificate link */}
                      {award.certificateUrl && (
                        <a
                          href={award.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});