#!/usr/bin/env npx tsx
/**
 * Cache Warm-up Script
 *
 * Run this after deployment to pre-populate ISR cache for main pages.
 * This ensures first visitors don't experience slow page loads.
 *
 * Usage:
 *   npx tsx scripts/warmup-cache.ts
 *   npx tsx scripts/warmup-cache.ts --base-url=https://yourdomain.com
 */

const BASE_URL = process.argv.find(arg => arg.startsWith('--base-url='))?.split('=')[1]
  || process.env.NEXT_PUBLIC_SERVER_URL
  || 'http://localhost:3000';

const CONCURRENCY = 3; // Number of parallel requests
const TIMEOUT = 30000; // 30 second timeout per request

interface WarmupResult {
  url: string;
  status: number | 'error';
  time: number;
  error?: string;
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CacheWarmup/1.0'
      }
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function warmUrl(url: string): Promise<WarmupResult> {
  const fullUrl = `${BASE_URL}${url}`;
  const start = Date.now();

  try {
    const response = await fetchWithTimeout(fullUrl, TIMEOUT);
    return {
      url,
      status: response.status,
      time: Date.now() - start
    };
  } catch (error) {
    return {
      url,
      status: 'error',
      time: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function warmUrls(urls: string[]): Promise<WarmupResult[]> {
  const results: WarmupResult[] = [];

  // Process in batches for controlled concurrency
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(warmUrl));
    results.push(...batchResults);

    // Log progress
    batchResults.forEach(r => {
      const status = r.status === 200 ? '✓' : r.status === 'error' ? '✗' : '?';
      const timeStr = `${r.time}ms`.padStart(6);
      console.log(`${status} ${timeStr} ${r.url}${r.error ? ` (${r.error})` : ''}`);
    });
  }

  return results;
}

async function fetchDynamicUrls(): Promise<string[]> {
  const urls: string[] = [];

  try {
    // Fetch vendor slugs
    const vendorsResponse = await fetchWithTimeout(`${BASE_URL}/api/warmup/vendors`, 5000);
    if (vendorsResponse.ok) {
      const vendors = await vendorsResponse.json();
      urls.push(...vendors.map((v: { slug: string }) => `/vendors/${v.slug}`));
    }
  } catch {
    console.warn('⚠️  Could not fetch vendor slugs from API');
  }

  try {
    // Fetch product slugs
    const productsResponse = await fetchWithTimeout(`${BASE_URL}/api/warmup/products`, 5000);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      urls.push(...products.map((p: { slug: string }) => `/products/${p.slug}`));
    }
  } catch {
    console.warn('⚠️  Could not fetch product slugs from API');
  }

  try {
    // Fetch blog slugs
    const blogResponse = await fetchWithTimeout(`${BASE_URL}/api/warmup/blog`, 5000);
    if (blogResponse.ok) {
      const posts = await blogResponse.json();
      urls.push(...posts.map((p: { slug: string }) => `/blog/${p.slug}`));
    }
  } catch {
    console.warn('⚠️  Could not fetch blog slugs from API');
  }

  return urls;
}

async function main() {
  console.log('🔥 Cache Warm-up Script');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('');

  // Static pages to warm up
  const staticUrls = [
    '/',
    '/vendors',
    '/products',
    '/blog',
    '/about',
    '/contact',
  ];

  console.log('📄 Warming static pages...');
  const staticResults = await warmUrls(staticUrls);

  console.log('');
  console.log('📄 Fetching dynamic page URLs...');
  const dynamicUrls = await fetchDynamicUrls();

  if (dynamicUrls.length > 0) {
    console.log(`   Found ${dynamicUrls.length} dynamic pages`);
    console.log('');
    console.log('📄 Warming dynamic pages...');
    const dynamicResults = await warmUrls(dynamicUrls);

    // Summary
    const allResults = [...staticResults, ...dynamicResults];
    const successful = allResults.filter(r => r.status === 200).length;
    const failed = allResults.filter(r => r.status === 'error' || (typeof r.status === 'number' && r.status >= 400)).length;
    const avgTime = Math.round(allResults.reduce((sum, r) => sum + r.time, 0) / allResults.length);

    console.log('');
    console.log('📊 Summary:');
    console.log(`   Total: ${allResults.length} pages`);
    console.log(`   Success: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Avg time: ${avgTime}ms`);
  } else {
    console.log('   No dynamic pages found (API endpoints may not exist yet)');
    console.log('');
    console.log('💡 Tip: Create /api/warmup/vendors, /api/warmup/products, /api/warmup/blog');
    console.log('   endpoints to enable dynamic page warming.');
  }

  console.log('');
  console.log('✅ Cache warm-up complete!');
}

main().catch(console.error);
