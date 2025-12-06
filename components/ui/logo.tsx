"use client";

import * as React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

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
  "6xl": "(max-width: 640px) 1024px, (max-width: 768px) 1152px, (max-width: 1024px) 1280px, (max-width: 1280px) 1408px, 1536px",
  "mobile-nav": "(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 256px, 320px"
};

export function Logo({ className, size = 'md', priority = false }: LogoProps): React.ReactElement {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("bg-muted animate-pulse rounded", sizeClasses[size], className)} />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark'
    ? '/media/company/logos/Paul-Thames-logo-PNG-white.png'
    : '/media/company/logos/Paul-Thames-logo-PNG-black.png';

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <Image
        src={logoSrc}
        alt="Paul Thames"
        fill
        className="object-contain"
        priority={priority}
        sizes={sizesAttribute[size]}
      />
    </div>
  );
}