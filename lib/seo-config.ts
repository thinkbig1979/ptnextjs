/**
 * SEO Configuration for Paul Thames website
 * This file exports consistent SEO metadata for use across the site
 */

export const SITE_CONFIG = {
  name: 'Paul Thames',
  title: 'Paul Thames | Technical Consultancy & Creative Lighting',
  description:
    'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
  url: 'https://paulthames.com',
  locale: 'en_GB',
  ogImage: '/og-image.png',
  author: 'Paul Thames',
  address: {
    locality: 'London',
    country: 'GB',
  },
}

export const PAGE_TITLES = {
  home: SITE_CONFIG.title,
  blog: 'Blog | Superyacht Technology Insights from Paul Thames',
  contact: 'Contact Paul Thames | Superyacht Technical Consultancy',
  products: 'Services & Products | Paul Thames Superyacht Solutions',
  about: 'About Us | Paul Thames',
  testimonials: 'Testimonials | What Clients Say About Paul Thames',
  vendors: 'Vendors | Superyacht Technology Solutions',
  yachts: 'Yacht Profiles | Marine Technology Platform',
  customLighting: 'Creative Lighting Solutions | Pixel-Based Fixtures for Superyachts',
  consultancyClients: 'Project Consultancy | Technical Advisory for Superyacht Projects',
  consultancySuppliers: 'Vendor Consultancy | Market Access for Marine Technology',
} as const

export const PAGE_DESCRIPTIONS = {
  home: SITE_CONFIG.description,
  blog: 'Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet.',
  contact:
    'Get in touch with Paul Thames for superyacht technical consultancy, creative lighting, and vendor advisory services.',
  products:
    'Discover Paul Thames technical consultancy and creative lighting services for superyachts, including project advisory and custom programming.',
  about: 'Edwin Edelenbos and Roel van der Zwet bring 25+ combined years in superyacht technology. Technical depth meets commercial expertise.',
  testimonials:
    'What clients, captains, and industry professionals say about working with Edwin Edelenbos on superyacht AV/IT, lighting, and technology projects.',
  vendors:
    'Explore our comprehensive directory of superyacht technology vendors and marine electronics suppliers. Find the right solutions for your yacht projects.',
  yachts:
    'Explore detailed yacht profiles with timeline visualization, supplier information, and sustainability metrics.',
  customLighting:
    'Pixel-based fixtures, custom content, and complete programming for superyachts and high-end architecture. When traditional lighting wont do.',
  consultancyClients:
    'Technical clarity for owners, designers, and shipyards at critical decision points. Specification review, creation, and on-demand support for superyacht projects.',
  consultancySuppliers:
    'Market access and visibility for manufacturers, distributors, and technology providers in the superyacht industry. Proposition testing, market strategy, and directory listings.',
} as const

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE_CONFIG.address.locality,
    addressCountry: SITE_CONFIG.address.country,
  },
}

export const PERSON_SCHEMAS = {
  edwin: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Edwin Edelenbos',
    jobTitle: 'Co-Founder',
    worksFor: SITE_CONFIG.name,
    knowsAbout: ['Superyacht Technology', 'AV/IT Systems', 'Marine Electronics', 'Security Systems'],
  },
  roel: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Roel van der Zwet',
    jobTitle: 'Co-Founder',
    worksFor: SITE_CONFIG.name,
    knowsAbout: ['Commercial Operations', 'Market Strategy', 'Vendor Relations'],
  },
}

export function getArticleSchema({
  title,
  description,
  publishedAt,
  updatedAt,
  author = 'Edwin Edelenbos',
  image,
}: {
  title: string
  description?: string
  publishedAt: string
  updatedAt: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: image || SITE_CONFIG.ogImage,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    datePublished: publishedAt,
    dateModified: updatedAt,
    description: description || SITE_CONFIG.description,
  }
}

export function getServiceSchema({
  name,
  description,
  areaServed = 'International',
}: {
  name: string
  description: string
  areaServed?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
    areaServed,
    description,
  }
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function getReviewSchema({
  author,
  ratingValue,
  reviewBody,
  itemReviewed,
}: {
  author: string
  ratingValue: number
  reviewBody: string
  itemReviewed: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue.toString(),
      bestRating: '5',
    },
    reviewBody,
    itemReviewed: {
      '@type': 'Service',
      name: itemReviewed,
    },
  }
}

export function getBreadcrumbSchema(items: Array<{ label: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_CONFIG.url}${item.href}`,
    })),
  }
}
