#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import the data from the transpiled data file
const { readFileSync } = require('fs');
const { join } = require('path');

// Read and parse the static data
const dataPath = join(__dirname, 'data/superyacht_technology_research.json');
const researchData = JSON.parse(readFileSync(dataPath, 'utf8'));

// Transform research data into structured format (matching lib/data.ts logic)
const partners = researchData.partner_companies.map((partner, index) => ({
  id: `partner-${index + 1}`,
  name: partner.company,
  category: partner.category,
  description: partner.description,
  founded: partner.founded || 2000 + (index % 20) + 5,
  location: partner.location || 'Netherlands',
  tags: partner.tags || [partner.category],
  featured: index < 6,
}));

const products = researchData.partner_companies.flatMap((partner, partnerIndex) => 
  (partner.sample_products || []).map((product, productIndex) => ({
    id: `product-${partnerIndex}-${productIndex}`,
    name: product.name,
    partnerId: `partner-${partnerIndex + 1}`,
    partnerName: partner.company,
    category: partner.category,
    description: product.description,
    features: product.features || [],
    tags: [partner.category, ...(product.features || []).slice(0, 2)],
  }))
);

// Create slugs from titles
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const blogPosts = researchData.industry_trends.map((trend, index) => {
  const slug = createSlug(trend.title);
  const fullExcerpt = trend.summary.length > 200 
    ? trend.summary.substring(0, 200) + '...' 
    : trend.summary;
  
  return {
    id: `blog-${index + 1}`,
    slug: slug,
    title: trend.title,
    excerpt: fullExcerpt,
    content: trend.summary, // Using summary as content for now
    author: ['Paul Thames', 'Sarah Johnson', 'Michael Chen', 'Lisa Rodriguez'][index % 4],
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

const teamMembers = [
  {
    id: 'team-1',
    name: 'Paul Thames',
    role: 'CEO & Founder',
    bio: 'With over 15 years of experience in marine technology and business development, Paul founded PT to bridge the gap between innovative superyacht technology providers and discerning yacht owners.',
    email: 'paul@paulthames.com',
  },
  {
    id: 'team-2',
    name: 'Sarah Johnson',
    role: 'Chief Technology Officer',
    bio: 'Sarah brings deep technical expertise in marine systems integration and has overseen technology implementations on over 200 superyacht projects worldwide.',
    email: 'sarah@paulthames.com',
  },
  {
    id: 'team-3',
    name: 'Michael Chen',
    role: 'Marketing Manager',
    bio: 'Michael specializes in luxury brand marketing and has been instrumental in establishing PT as a trusted name in the superyacht technology sector.',
    email: 'michael@paulthames.com',
  },
  {
    id: 'team-4',
    name: 'Lisa Rodriguez',
    role: 'Sales Manager',
    bio: 'Lisa leverages her extensive network in the superyacht industry to connect clients with the perfect technology solutions for their vessels.',
    email: 'lisa@paulthames.com',
  },
];

const companyInfo = {
  name: 'Paul Thames',
  tagline: 'Connecting Superyacht Technology Excellence',
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

const categories = Array.from(new Set(partners.map(p => p.category)));

// Helper functions
const getPartnersByCategory = (category) => {
  if (!category || category === "all") return partners;
  return partners.filter(partner => partner.category === category);
};

const getProductsByCategory = (category) => {
  if (!category || category === "all") return products;
  return products.filter(product => product.category === category);
};

const getBlogPostsByCategory = (category) => {
  if (!category) return blogPosts;
  return blogPosts.filter(post => post.category === category);
};

const searchPartners = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return partners.filter(partner => 
    partner.name.toLowerCase().includes(lowercaseQuery) ||
    partner.description.toLowerCase().includes(lowercaseQuery) ||
    partner.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

const searchProducts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

const searchBlogPosts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to format data in Strapi format
const formatStrapiResponse = (data, pagination = null) => {
  const response = { data };
  if (pagination) {
    response.meta = { pagination };
  }
  return response;
};

const formatStrapiEntry = (item) => ({
  id: typeof item.id === 'string' ? parseInt(item.id.replace(/[^0-9]/g, '')) || Math.random() * 1000 : item.id || Math.random() * 1000,
  attributes: { ...item },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categoryData = categories.map((cat, index) => formatStrapiEntry({
    id: index + 1,
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
    description: `${cat} category`,
    icon: 'package',
    color: '#3B82F6'
  }));
  
  res.json(formatStrapiResponse(categoryData));
});

// Partners endpoint
app.get('/api/partners', (req, res) => {
  let filteredPartners = [...partners];
  
  // Filter by category
  if (req.query['filters[category][name][$eq]']) {
    const category = decodeURIComponent(req.query['filters[category][name][$eq]']);
    filteredPartners = getPartnersByCategory(category);
  }
  
  // Filter by featured
  if (req.query['filters[featured][$eq]']) {
    const featured = req.query['filters[featured][$eq]'] === 'true';
    filteredPartners = filteredPartners.filter(p => p.featured === featured);
  }
  
  // Search functionality
  if (req.query['filters[$or][0][name][$containsi]']) {
    const query = decodeURIComponent(req.query['filters[$or][0][name][$containsi]']);
    filteredPartners = searchPartners(query);
  }
  
  const partnerData = filteredPartners.map(partner => formatStrapiEntry({
    ...partner,
    category: { data: { attributes: { name: partner.category } } },
    tags: { data: partner.tags.map(tag => ({ attributes: { name: tag } })) }
  }));
  
  res.json(formatStrapiResponse(partnerData));
});

// Single partner endpoint
app.get('/api/partners/:id', (req, res) => {
  const partner = partners.find(p => p.id === req.params.id);
  if (!partner) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  
  const partnerData = formatStrapiEntry({
    ...partner,
    category: { data: { attributes: { name: partner.category } } },
    tags: { data: partner.tags.map(tag => ({ attributes: { name: tag } })) }
  });
  
  res.json(formatStrapiResponse(partnerData));
});

// Products endpoint
app.get('/api/products', (req, res) => {
  let filteredProducts = [...products];
  
  // Filter by category
  if (req.query['filters[category][name][$eq]']) {
    const category = decodeURIComponent(req.query['filters[category][name][$eq]']);
    filteredProducts = getProductsByCategory(category);
  }
  
  // Filter by partner
  if (req.query['filters[partner][id][$eq]']) {
    const partnerId = req.query['filters[partner][id][$eq]'];
    filteredProducts = filteredProducts.filter(p => p.partnerId === partnerId);
  }
  
  // Search functionality
  if (req.query['filters[$or][0][name][$containsi]']) {
    const query = decodeURIComponent(req.query['filters[$or][0][name][$containsi]']);
    filteredProducts = searchProducts(query);
  }
  
  const productData = filteredProducts.map(product => formatStrapiEntry({
    ...product,
    partner: { data: { id: product.partnerId, attributes: { name: product.partnerName } } },
    category: { data: { attributes: { name: product.category } } },
    features: product.features.map(feature => ({ title: feature })),
    tags: { data: product.tags.map(tag => ({ attributes: { name: tag } })) }
  }));
  
  res.json(formatStrapiResponse(productData));
});

// Single product endpoint
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const productData = formatStrapiEntry({
    ...product,
    partner: { data: { id: product.partnerId, attributes: { name: product.partnerName } } },
    category: { data: { attributes: { name: product.category } } },
    features: product.features.map(feature => ({ title: feature })),
    tags: { data: product.tags.map(tag => ({ attributes: { name: tag } })) }
  });
  
  res.json(formatStrapiResponse(productData));
});

// Blog posts endpoint
app.get('/api/blog-posts', (req, res) => {
  let filteredPosts = [...blogPosts];
  
  // Filter by category
  if (req.query['filters[category][$eq]']) {
    const category = decodeURIComponent(req.query['filters[category][$eq]']);
    filteredPosts = getBlogPostsByCategory(category);
  }
  
  // Filter by featured
  if (req.query['filters[featured][$eq]']) {
    const featured = req.query['filters[featured][$eq]'] === 'true';
    filteredPosts = filteredPosts.filter(p => p.featured === featured);
  }
  
  // Filter by slug
  if (req.query['filters[slug][$eq]']) {
    const slug = req.query['filters[slug][$eq]'];
    filteredPosts = filteredPosts.filter(p => p.slug === slug);
  }
  
  // Search functionality
  if (req.query['filters[$or][0][title][$containsi]']) {
    const query = decodeURIComponent(req.query['filters[$or][0][title][$containsi]']);
    filteredPosts = searchBlogPosts(query);
  }
  
  const postData = filteredPosts.map(post => formatStrapiEntry({
    ...post,
    tags: { data: post.tags.map(tag => ({ attributes: { name: tag } })) }
  }));
  
  res.json(formatStrapiResponse(postData));
});

// Team members endpoint
app.get('/api/team-members', (req, res) => {
  const teamData = teamMembers.map(formatStrapiEntry);
  res.json(formatStrapiResponse(teamData));
});

// Company info endpoint
app.get('/api/company-info', (req, res) => {
  res.json(formatStrapiResponse(formatStrapiEntry(companyInfo)));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.STRAPI_PORT || 1337;
app.listen(port, () => {
  console.log(`🚀 Complete Strapi-compatible server running on http://localhost:${port}/api`);
  console.log(`📊 Serving ${partners.length} partners, ${products.length} products, ${blogPosts.length} blog posts`);
  console.log(`📚 Data loaded from: ${dataPath}`);
  console.log(`🔄 All endpoints properly formatted for Strapi client compatibility`);
});