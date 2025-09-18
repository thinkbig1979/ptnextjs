import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  Heart,
  Trophy,
  MapPin,
  Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialProofMetrics {
  linkedinFollowers?: number;
  completedProjects?: number;
  yearsInBusiness?: number;
  clientSatisfactionRate?: number;
  industryRanking?: number;
  teamSize?: number;
  globalPresence?: number;
}

// Type guard for social proof metrics validation
function isValidSocialProofMetrics(metrics: unknown): metrics is SocialProofMetrics {
  if (typeof metrics !== 'object' || metrics === null) {
    return false;
  }

  const validKeys = [
    'linkedinFollowers', 'completedProjects', 'yearsInBusiness',
    'clientSatisfactionRate', 'industryRanking', 'teamSize', 'globalPresence'
  ];

  return Object.keys(metrics).every(key => validKeys.includes(key)) &&
    Object.values(metrics).every(value =>
      value === undefined || (typeof value === 'number' && value >= 0)
    );
}

interface SocialProofMetricsProps {
  metrics: SocialProofMetrics | null;
  loading?: boolean;
  animated?: boolean;
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

const AnimatedCounter = React.memo(function AnimatedCounter({
  value,
  formatter = (n: number) => n.toString()
}: {
  value: number;
  formatter?: (n: number) => string;
}) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCount(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span data-testid="animated-counter" className="transition-all duration-1000">
      {formatter(count)}
    </span>
  );
});

function MetricSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </div>
  );
}

export const SocialProofMetrics = React.memo(function SocialProofMetrics({
  metrics,
  loading = false,
  animated = false,
  className,
}: SocialProofMetricsProps) {
  if (loading || !metrics) {
    return (
      <div
        data-testid="metrics-skeleton"
        className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <MetricSkeleton />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricItems = React.useMemo(() => [
    {
      key: 'linkedinFollowers',
      value: metrics.linkedinFollowers,
      label: 'LinkedIn Followers',
      icon: Linkedin,
      testId: 'linkedin-icon',
      formatter: formatNumber,
      color: 'text-blue-600'
    },
    {
      key: 'completedProjects',
      value: metrics.completedProjects,
      label: 'Completed Projects',
      icon: Building2,
      testId: 'projects-icon',
      formatter: formatNumber,
      color: 'text-green-600'
    },
    {
      key: 'yearsInBusiness',
      value: metrics.yearsInBusiness,
      label: 'Years in Business',
      icon: Calendar,
      testId: 'calendar-icon',
      formatter: (n: number) => n.toString(),
      color: 'text-purple-600'
    },
    {
      key: 'clientSatisfactionRate',
      value: metrics.clientSatisfactionRate,
      label: 'Client Satisfaction',
      icon: Heart,
      testId: 'heart-icon',
      formatter: (n: number) => `${n}%`,
      color: 'text-green-600'
    },
    {
      key: 'industryRanking',
      value: metrics.industryRanking,
      label: 'Industry Ranking',
      icon: Trophy,
      testId: 'trophy-icon',
      formatter: (n: number) => `#${n}`,
      color: 'text-yellow-600'
    },
    {
      key: 'teamSize',
      value: metrics.teamSize,
      label: 'Team Members',
      icon: Users,
      testId: 'users-icon',
      formatter: (n: number) => n.toString(),
      color: 'text-indigo-600'
    },
    {
      key: 'globalPresence',
      value: metrics.globalPresence,
      label: 'Countries',
      icon: MapPin,
      testId: 'map-icon',
      formatter: (n: number) => n.toString(),
      color: 'text-red-600'
    }
  ].filter(item => item.value !== undefined), [metrics]);

  return (
    <div
      data-testid="social-proof-metrics"
      className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}
    >
      {metricItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.key}
            className="transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <CardContent className="p-4">
              <div
                data-testid="metric-item"
                className={cn(
                  "flex flex-col items-center text-center",
                  item.key === 'clientSatisfactionRate' && "text-green-600"
                )}
              >
                <Icon
                  data-testid={item.testId}
                  className={cn("w-6 h-6 mb-2", item.color)}
                />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {animated ? (
                    <AnimatedCounter
                      value={item.value!}
                      formatter={item.formatter}
                    />
                  ) : (
                    item.formatter(item.value!)
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                  {item.label}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});