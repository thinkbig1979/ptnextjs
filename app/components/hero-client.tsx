
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export function HeroClient() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative w-64 md:w-96 h-20 md:h-32 bg-muted animate-pulse rounded" />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' 
    ? '/images/Paul-Thames-logo-PNG-white.png'
    : '/images/Paul-Thames-logo-PNG-black.png';

  return (
    <div className="relative w-64 md:w-96 h-20 md:h-32">
      <Image
        src={logoSrc}
        alt="Paul Thames"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 256px, 384px"
      />
    </div>
  );
}
