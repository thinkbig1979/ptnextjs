
import researchData from '../data/superyacht_technology_research.json';
import { blogContent } from './blog-content';

export interface Partner {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  website?: string;
  founded?: number;
  location?: string;
  tags: string[];
  featured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  category: string;
  description: string;
  image?: string;
  features: string[];
  price?: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  image?: string;
  featured?: boolean;
  readTime?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin?: string;
}

// Create slugs from titles
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Transform research data into structured format
export const partners: Partner[] = researchData.partner_companies.map((partner: any, index: number) => {
  const partnerName = partner.company + ' - FB';
  return {
    id: `partner-${index + 1}`,
    slug: createSlug(partnerName),
    name: partnerName,
    category: partner.category,
    description: partner.description,
    founded: partner.founded || 2000 + (index % 20) + 5,
    location: partner.location || 'Netherlands',
    tags: partner.tags || [partner.category],
    featured: index < 6,
  };
});

export const products: Product[] = researchData.partner_companies.flatMap((partner: any, partnerIndex: number) => 
  (partner.sample_products || []).map((product: any, productIndex: number) => ({
    id: `product-${partnerIndex}-${productIndex}`,
    name: product.name + ' - FB',
    partnerId: `partner-${partnerIndex + 1}`,
    partnerName: partner.company + ' - FB',
    category: partner.category,
    description: product.description,
    features: product.features || [],
    tags: [partner.category, ...(product.features || []).slice(0, 2)],
  }))
);

export const blogPosts: BlogPost[] = researchData.industry_trends.map((trend: any, index: number) => {
  const slug = createSlug(trend.title);
  const fullExcerpt = trend.summary.length > 200 
    ? trend.summary.substring(0, 200) + '...' 
    : trend.summary;
  
  return {
    id: `blog-${index + 1}`,
    slug: slug,
    title: trend.title + ' - FB',
    excerpt: fullExcerpt,
    content: blogContent[slug] || trend.summary,
    author: ['Paul Thames - FB', 'Sarah Johnson - FB', 'Michael Chen - FB', 'Lisa Rodriguez - FB'][index % 4],
    publishedAt: new Date(2024, 11 - index, 15 - (index * 3)).toISOString(),
    category: ['Technology Trends', 'Industry News', 'Innovation', 'Product Updates'][index % 4],
    tags: [
      'superyacht', 
      'technology', 
      'innovation',
      ...(index === 0 ? ['ai', 'automation'] : []),
      ...(index === 1 ? ['sustainability', 'propulsion'] : []),
      ...(index === 2 ? ['renewable energy', 'solar'] : []),
      ...(index === 3 ? ['AR', 'maintenance'] : []),
      ...(index === 4 ? ['connectivity', 'satellite'] : []),
      ...(index === 5 ? ['entertainment', 'VR'] : []),
      ...(index === 6 ? ['smart materials', 'efficiency'] : []),
      ...(index === 7 ? ['exploration', 'submersibles'] : []),
    ].slice(0, 6),
    featured: index < 3,
    readTime: `${Math.max(5, Math.min(15, (index % 5) + 8))} min read`,
  };
});

export const teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Paul Thames - FB',
    role: 'CEO & Founder',
    bio: 'With over 15 years of experience in marine technology and business development, Paul founded PT to bridge the gap between innovative superyacht technology providers and discerning yacht owners.',
    email: 'paul@paulthames.com',
  },
  {
    id: 'team-2',
    name: 'Sarah Johnson - FB',
    role: 'Chief Technology Officer',
    bio: 'Sarah brings deep technical expertise in marine systems integration and has overseen technology implementations on over 200 superyacht projects worldwide.',
    email: 'sarah@paulthames.com',
  },
  {
    id: 'team-3',
    name: 'Michael Chen - FB',
    role: 'Marketing Manager',
    bio: 'Michael specializes in luxury brand marketing and has been instrumental in establishing PT as a trusted name in the superyacht technology sector.',
    email: 'michael@paulthames.com',
  },
  {
    id: 'team-4',
    name: 'Lisa Rodriguez - FB',
    role: 'Sales Manager',
    bio: 'Lisa leverages her extensive network in the superyacht industry to connect clients with the perfect technology solutions for their vessels.',
    email: 'lisa@paulthames.com',
  },
];

export const companyInfo = {
  name: 'Paul Thames - FB',
  tagline: 'Connecting Superyacht Technology Excellence - FB',
  description: 'Paul Thames (PT) is Amsterdam\'s premier superyacht technology consultancy, specializing in connecting discerning yacht owners with cutting-edge marine technology solutions.',
  founded: 2018,
  location: 'Amsterdam, Netherlands',
  address: 'Herengracht 450, 1017 CA Amsterdam, Netherlands',
  phone: '+31 20 555 0123',
  email: 'info@paulthames.com',
  story: `Founded in 2018 by British entrepreneur Paul Thames, our company emerged from a deep passion for both maritime excellence and technological innovation. With roots spanning the Netherlands' rich maritime heritage and the UK's tradition of naval engineering, PT was established to address a critical gap in the superyacht industry.

Paul recognized that while superyacht technology was advancing rapidly, owners and captains often struggled to identify and implement the right solutions for their vessels. Drawing on his background in marine engineering and business development, he created PT as a trusted bridge between innovative technology providers and the sophisticated demands of the superyacht community.

Today, PT operates from our Amsterdam headquarters, strategically positioned in one of Europe's most important maritime hubs. Our team combines Dutch precision with international expertise, serving clients across Europe, the Mediterranean, and beyond.`,
};

// Utility functions
export const getPartnersByCategory = (category?: string): Partner[] => {
  if (!category || category === "all") return partners;
  return partners.filter(partner => partner.category === category);
};

export const getProductsByCategory = (category?: string): Product[] => {
  if (!category || category === "all") return products;
  return products.filter(product => product.category === category);
};

export const getBlogPostsByCategory = (category?: string): BlogPost[] => {
  if (!category) return blogPosts;
  return blogPosts.filter(post => post.category === category);
};

export const searchPartners = (query: string): Partner[] => {
  const lowercaseQuery = query.toLowerCase();
  return partners.filter(partner => 
    partner.name.toLowerCase().includes(lowercaseQuery) ||
    partner.description.toLowerCase().includes(lowercaseQuery) ||
    partner.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const searchBlogPosts = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const categories = Array.from(new Set(partners.map(p => p.category)));
export const blogCategories = Array.from(new Set(blogPosts.map(p => p.category)));

// Cross-filtering helper functions
export const getProductsByPartner = (partnerId: string): Product[] => {
  return products.filter(product => product.partnerId === partnerId);
};

export const getPartnerByProduct = (productId: string): Partner | undefined => {
  const product = products.find(p => p.id === productId);
  if (!product) return undefined;
  return partners.find(partner => partner.id === product.partnerId);
};



export const getProductsByPartnerName = (partnerName: string): Product[] => {
  return products.filter(product => product.partnerName === partnerName);
};

export const getRelatedPosts = (currentPostId: string, limit: number = 3): BlogPost[] => {
  const currentPost = blogPosts.find(post => post.id === currentPostId);
  if (!currentPost) return [];

  // Find posts with similar tags or same category
  const relatedPosts = blogPosts
    .filter(post => post.id !== currentPostId)
    .map(post => {
      let score = 0;
      
      // Higher score for same category
      if (post.category === currentPost.category) {
        score += 3;
      }
      
      // Score for matching tags
      const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += commonTags.length;
      
      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  // If we don't have enough related posts, fill with recent posts
  if (relatedPosts.length < limit) {
    const recentPosts = blogPosts
      .filter(post => post.id !== currentPostId && !relatedPosts.find(rp => rp.id === post.id))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit - relatedPosts.length);
    
    relatedPosts.push(...recentPosts);
  }

  return relatedPosts;
};

export const getPartnerByName = (partnerName: string): Partner | undefined => {
  return partners.find(partner => partner.name === partnerName);
};

export const getPartnerById = (id: string): Partner | undefined => {
  return partners.find(partner => partner.id === id);
};

export const getPartnerBySlug = (slug: string): Partner | undefined => {
  return partners.find(partner => partner.slug === slug);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// URL parameter utilities
export const createFilterUrl = (basePath: string, params: {
  category?: string;
  partner?: string;
  search?: string;
}): string => {
  const url = new URL(basePath, window.location.origin);
  
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

export const parseFilterParams = (searchParams: URLSearchParams) => {
  return {
    category: searchParams.get('category') || 'all',
    partner: searchParams.get('partner') || '',
    search: searchParams.get('search') || '',
  };
};
