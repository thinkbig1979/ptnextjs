"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Enhanced system theme detection for Firefox mobile compatibility
function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  // Multiple detection methods for maximum compatibility
  const methods = [
    // Standard method
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    // Firefox mobile fallback - check computed styles
    () => {
      const testEl = document.createElement('div')
      testEl.style.display = 'none'
      testEl.style.colorScheme = 'dark light'
      document.body.appendChild(testEl)
      const computedStyle = getComputedStyle(testEl)
      const isDark = computedStyle.colorScheme.includes('dark')
      document.body.removeChild(testEl)
      return isDark
    },
    // Another fallback - check if browser supports dark mode
    () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    }
  ]
  
  // Try each method until one works
  for (const method of methods) {
    try {
      if (method()) return 'dark'
    } catch (e) {
      console.debug('Theme detection method failed:', e)
    }
  }
  
  return 'light'
}

function EnhancedThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    setMounted(true)
    
    // Initial system theme detection
    const initialTheme = detectSystemTheme()
    setSystemTheme(initialTheme)
    
    // Set up media query listener with enhanced detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setSystemTheme(newTheme)
      console.debug('System theme changed to:', newTheme)
    }
    
    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
    
    // Firefox mobile specific: periodic check as fallback
    const isFirefoxMobile = /Firefox.*Mobile/.test(navigator.userAgent) || 
                           (/Firefox/.test(navigator.userAgent) && /Android/.test(navigator.userAgent))
    
    let intervalId: NodeJS.Timeout | null = null
    
    if (isFirefoxMobile) {
      // Check every 2 seconds for theme changes on Firefox mobile
      intervalId = setInterval(() => {
        const currentTheme = detectSystemTheme()
        if (currentTheme !== systemTheme) {
          setSystemTheme(currentTheme)
          console.debug('Firefox mobile theme change detected:', currentTheme)
        }
      }, 2000)
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [systemTheme])

  // Force system theme update in next-themes
  React.useEffect(() => {
    if (mounted && props.defaultTheme === 'system') {
      // Dispatch a custom event to notify about system theme
      window.dispatchEvent(new CustomEvent('system-theme-change', { 
        detail: { theme: systemTheme } 
      }))
    }
  }, [systemTheme, mounted, props.defaultTheme])

  return (
    <NextThemesProvider 
      {...props}
      forcedTheme={undefined}
      storageKey="theme-preference"
    >
      {children}
    </NextThemesProvider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <EnhancedThemeProvider {...props}>{children}</EnhancedThemeProvider>
}
