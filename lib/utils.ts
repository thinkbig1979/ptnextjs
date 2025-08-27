import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

// URL parameter utilities for static sites
export const parseFilterParams = (searchParams: URLSearchParams) => {
  return {
    category: searchParams.get('category') || 'all',
    partner: searchParams.get('partner') || '',
    search: searchParams.get('search') || '',
    view: searchParams.get('view') || 'partners',
  };
};

export const createFilterUrl = (basePath: string, params: {
  category?: string;
  partner?: string;
  search?: string;
}): string => {
  const url = new URL(basePath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  if (params.category && params.category !== "all") {
    url.searchParams.set('category', params.category);
  }
  if (params.partner) {
    url.searchParams.set('partner', params.partner);
  }
  if (params.search) {
    url.searchParams.set('search', params.search);
  }
  
  return url.pathname + url.search;
};