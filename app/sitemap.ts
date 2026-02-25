import type { MetadataRoute } from 'next'
import { payloadCMSDataService } from '@/lib/payload-cms-data-service'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate at most every hour

// Static pages with known priorities
const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/about', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/custom-lighting', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/consultancy/clients', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/consultancy/suppliers', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/testimonials', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/vendors', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/custom-lighting/services', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/info-for-vendors', changeFrequency: 'monthly', priority: 0.7 },
]

const BASE_URL = 'https://paulthames.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Dynamic entries from DB
  let blogEntries: MetadataRoute.Sitemap = []
  let vendorEntries: MetadataRoute.Sitemap = []

  try {
    const posts = await payloadCMSDataService.getAllBlogPosts()
    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (e) {
    console.warn('Sitemap: Could not fetch blog posts:', e instanceof Error ? e.message : e)
  }

  try {
    const vendors = await payloadCMSDataService.getAllVendors()
    vendorEntries = vendors.map((vendor) => ({
      url: `${BASE_URL}/vendors/${vendor.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (e) {
    console.warn('Sitemap: Could not fetch vendors:', e instanceof Error ? e.message : e)
  }

  let productEntries: MetadataRoute.Sitemap = []

  try {
    const products = await payloadCMSDataService.getAllProducts()
    productEntries = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug || product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (e) {
    console.warn('Sitemap: Could not fetch products:', e instanceof Error ? e.message : e)
  }

  let yachtEntries: MetadataRoute.Sitemap = []

  try {
    const yachts = await payloadCMSDataService.getYachts()
    yachtEntries = yachts.map((yacht) => ({
      url: `${BASE_URL}/yachts/${yacht.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (e) {
    console.warn('Sitemap: Could not fetch yachts:', e instanceof Error ? e.message : e)
  }

  return [...staticEntries, ...blogEntries, ...vendorEntries, ...productEntries, ...yachtEntries]
}
