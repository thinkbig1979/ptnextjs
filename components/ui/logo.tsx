import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '3xl' | '6xl' | 'mobile-nav';
  priority?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-32",
  md: "h-12 w-48 sm:h-14 sm:w-56",
  lg: "h-16 w-64 md:h-20 md:w-80",
  xl: "h-20 w-80 md:h-24 md:w-96",
  "3xl": "h-32 w-full max-w-2xl sm:h-40 md:h-48 lg:h-60",
  "6xl": "h-48 w-full max-w-4xl sm:h-60 md:h-72 lg:h-80 xl:h-96",
  "mobile-nav": "h-16 w-64 sm:h-20 sm:w-80 md:h-16 md:w-64 lg:h-20 lg:w-80"
};

const sizesAttribute = {
  sm: "128px",
  md: "(max-width: 640px) 192px, 224px",
  lg: "(max-width: 768px) 256px, 320px",
  xl: "(max-width: 768px) 320px, 384px",
  "3xl": "(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 896px, 896px",
  "6xl": "(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 896px, 896px",
  "mobile-nav": "(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 256px, 320px"
};

/**
 * Server-rendered Logo component that uses CSS dark: classes to toggle
 * between light/dark variants without waiting for JS hydration.
 * This ensures the LCP image is discoverable from HTML immediately.
 */
export function Logo({ className, size = 'md', priority = false }: LogoProps): React.ReactElement {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Light mode logo - hidden in dark mode */}
      <Image
        src="/media/company/logos/Paul-Thames-logo-PNG-black.png"
        alt="Paul Thames"
        fill
        className="object-contain dark:hidden"
        priority={priority}
        sizes={sizesAttribute[size]}
      />
      {/* Dark mode logo - hidden in light mode */}
      <Image
        src="/media/company/logos/Paul-Thames-logo-PNG-white.png"
        alt="Paul Thames"
        fill
        className="object-contain hidden dark:block"
        priority={priority}
        sizes={sizesAttribute[size]}
      />
    </div>
  );
}
