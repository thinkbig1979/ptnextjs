
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [detectedSystemTheme, setDetectedSystemTheme] = React.useState<'light' | 'dark'>('light');

  // Enhanced system theme detection for Firefox mobile
  const detectSystemTheme = React.useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    
    // Firefox mobile specific detection
    const isFirefoxMobile = /Firefox.*Mobile/.test(navigator.userAgent) || 
                           (/Firefox/.test(navigator.userAgent) && /Android/.test(navigator.userAgent));
    
    if (isFirefoxMobile) {
      // Use multiple detection methods for Firefox mobile
      try {
        // Method 1: Check CSS media query support
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (darkModeQuery.matches) return 'dark';
        
        // Method 2: Check computed styles
        const testDiv = document.createElement('div');
        testDiv.style.display = 'none';
        testDiv.style.colorScheme = 'dark light';
        document.body.appendChild(testDiv);
        
        const computed = getComputedStyle(testDiv);
        const isDark = computed.colorScheme.includes('dark');
        
        document.body.removeChild(testDiv);
        
        if (isDark) return 'dark';
        
        // Method 3: Manual check using time-based heuristic (rough fallback)
        const hour = new Date().getHours();
        if (hour < 6 || hour > 20) return 'dark';
        
      } catch (e) {
        console.debug('Firefox mobile theme detection failed:', e);
      }
    }
    
    // Standard detection for other browsers
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  React.useEffect(() => {
    setMounted(true);
    
    // Initial detection
    const initialTheme = detectSystemTheme();
    setDetectedSystemTheme(initialTheme);
    
    // Set up listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      const newTheme = detectSystemTheme();
      setDetectedSystemTheme(newTheme);
      
      // If currently on system theme, force update
      if (theme === 'system') {
        // Trigger a re-render by briefly switching and switching back
        setTimeout(() => {
          const event = new CustomEvent('theme-change', { detail: { theme: newTheme } });
          window.dispatchEvent(event);
        }, 100);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Firefox mobile: Additional polling fallback
    const isFirefoxMobile = /Firefox.*Mobile/.test(navigator.userAgent) || 
                           (/Firefox/.test(navigator.userAgent) && /Android/.test(navigator.userAgent));
    
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (isFirefoxMobile) {
      pollInterval = setInterval(() => {
        const currentTheme = detectSystemTheme();
        if (currentTheme !== detectedSystemTheme) {
          setDetectedSystemTheme(currentTheme);
          handleSystemThemeChange();
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [theme, detectedSystemTheme, detectSystemTheme]);

  const handleToggle = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
    
    // Force blur on mobile to remove highlight
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const getAriaLabel = () => {
    if (theme === "system") return `Using system theme (currently ${detectedSystemTheme}), click to switch to light theme`;
    if (theme === "light") return "Using light theme, click to switch to dark theme";
    return "Using dark theme, click to switch to system theme";
  };

  const getCurrentIcon = () => {
    if (theme === "system") {
      // Show both system icon and current theme mode icon
      return (
        <div className="flex items-center space-x-1">
          <Monitor className="h-[1rem] w-[1rem] transition-all" />
          {detectedSystemTheme === 'dark' ? 
            <Moon className="h-[1rem] w-[1rem] transition-all opacity-75" /> :
            <Sun className="h-[1rem] w-[1rem] transition-all opacity-75" />
          }
        </div>
      );
    }
    if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;
    }
    return <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />;
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Loading theme toggle"
        className="hover:bg-accent/10 transition-colors focus:bg-transparent active:bg-transparent touch-manipulation w-12"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={getAriaLabel()}
      className={`hover:bg-accent/10 transition-colors focus:bg-transparent active:bg-transparent touch-manipulation ${
        theme === "system" ? "w-12" : ""
      }`}
    >
      {getCurrentIcon()}
      <span className="sr-only">{getAriaLabel()}</span>
    </Button>
  );
}
