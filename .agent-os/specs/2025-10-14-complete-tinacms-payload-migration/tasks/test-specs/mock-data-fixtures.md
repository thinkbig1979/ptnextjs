# Mock Data & Fixtures Specification

> Created: 2025-10-15
> Phase: Phase 2 - Backend Implementation
> Task: TEST-BACKEND-COLLECTIONS

## Overview

This document defines the complete mock data and fixtures strategy for testing all 8 Payload CMS collections. It includes realistic sample data, utility functions for data generation, and patterns for creating test fixtures.

---

## 1. Test Utilities (`__tests__/utils/testHelpers.ts`)

### Mock Payload Instance

```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Create mock Payload instance with in-memory database for testing
 */
export async function createMockPayload(): Promise<Payload> {
  const payload = await getPayload({
    config: {
      ...config,
      db: {
        type: 'sqlite',
        url: ':memory:', // In-memory database for fast tests
      },
    },
  });

  return payload;
}

/**
 * Clean up test database after each test
 */
export async function cleanupDatabase(payload: Payload): Promise<void> {
  // Delete all documents from all collections
  const collections = [
    'vendors',
    'products',
    'yachts',
    'tags',
    'categories',
    'blog-posts',
    'team-members',
    'company-info',
    'users',
  ];

  for (const collection of collections) {
    const docs = await payload.find({ collection, limit: 1000 });
    for (const doc of docs.docs) {
      await payload.delete({ collection, id: doc.id });
    }
  }
}

/**
 * Setup and teardown for each test file
 */
export function setupTestDatabase() {
  let payload: Payload;

  beforeAll(async () => {
    payload = await createMockPayload();
  });

  afterEach(async () => {
    await cleanupDatabase(payload);
  });

  afterAll(async () => {
    // Close database connection
    await payload.db.destroy();
  });

  return { getPayload: () => payload };
}
```

### User Creation Helpers

```typescript
/**
 * Create test user with specified role
 */
export async function createTestUser(
  payload: Payload,
  role: 'admin' | 'vendor' | 'author'
): Promise<User> {
  const email = `${role}-${Date.now()}@test.com`;

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password: 'test-password-123',
      role,
    },
  });

  return user;
}

/**
 * Create test vendor with specified tier
 */
export async function createTestVendor(
  payload: Payload,
  tier: 'free' | 'tier1' | 'tier2',
  overrides?: Partial<Vendor>
): Promise<Vendor> {
  const user = await createTestUser(payload, 'vendor');

  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      companyName: `Test Vendor ${Date.now()}`,
      slug: `test-vendor-${Date.now()}`,
      contactEmail: `vendor-${Date.now()}@test.com`,
      user: user.id,
      tier,
      ...overrides,
    },
  });

  return { ...vendor, user };
}
```

### Assertion Helpers

```typescript
/**
 * Assert field validation error
 */
export function assertValidationError(
  error: any,
  field: string,
  message?: string
): void {
  expect(error).toBeDefined();
  expect(error.message).toMatch(new RegExp(field, 'i'));
  if (message) {
    expect(error.message).toMatch(new RegExp(message, 'i'));
  }
}

/**
 * Assert access denied error
 */
export function assertAccessDenied(error: any): void {
  expect(error).toBeDefined();
  expect(error.message).toMatch(/access denied/i);
}

/**
 * Assert relationship integrity
 */
export async function assertRelationshipExists(
  payload: Payload,
  collection: string,
  id: string,
  relationField: string,
  relationId: string
): Promise<void> {
  const doc = await payload.findByID({
    collection,
    id,
    depth: 1,
  });

  expect(doc[relationField]).toBeDefined();

  if (Array.isArray(doc[relationField])) {
    expect(doc[relationField]).toContainEqual(
      expect.objectContaining({ id: relationId })
    );
  } else {
    expect(doc[relationField].id).toBe(relationId);
  }
}

/**
 * Generate test slug from name
 */
export function generateTestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Wait for async hooks to complete
 */
export async function waitForHooks(ms: number = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 2. Fixtures (`__tests__/utils/fixtures.ts`)

### Vendor Fixtures

```typescript
export const vendorFixtures = {
  /**
   * Free tier vendor with minimal fields
   */
  freeVendor: (userId: string): Partial<Vendor> => ({
    companyName: 'ACME Marine Systems',
    slug: 'acme-marine-systems',
    description: 'Leading provider of marine electronics and navigation systems.',
    contactEmail: 'contact@acme-marine.com',
    contactPhone: '+1-555-0100',
    user: userId,
    tier: 'free',
    published: true,
    featured: false,
  }),

  /**
   * Tier 1 vendor with enhanced fields
   */
  tier1Vendor: (userId: string): Partial<Vendor> => ({
    companyName: 'Premium Marine Tech',
    slug: 'premium-marine-tech',
    description: 'Advanced marine technology solutions for superyachts.',
    contactEmail: 'info@premium-marine.com',
    contactPhone: '+1-555-0101',
    user: userId,
    tier: 'tier1',
    website: 'https://premium-marine.com',
    linkedinUrl: 'https://linkedin.com/company/premium-marine-tech',
    twitterUrl: 'https://twitter.com/premiummarine',
    certifications: [
      { certification: 'ISO 9001:2015' },
      { certification: 'ISO 14001:2015' },
      { certification: 'NMEA 2000 Certified' },
    ],
    published: true,
    featured: false,
  }),

  /**
   * Tier 2 vendor with all enhanced fields
   */
  tier2Vendor: (userId: string): Partial<Vendor> => ({
    companyName: 'Elite Yacht Systems',
    slug: 'elite-yacht-systems',
    description: 'Full-service marine technology integration for luxury yachts.',
    contactEmail: 'sales@eliteyachtsystems.com',
    contactPhone: '+1-555-0102',
    user: userId,
    tier: 'tier2',
    website: 'https://eliteyachtsystems.com',
    linkedinUrl: 'https://linkedin.com/company/elite-yacht-systems',
    twitterUrl: 'https://twitter.com/eliteyachtsys',
    certifications: [
      { certification: 'ISO 9001:2015' },
      { certification: 'NMEA 2000 Certified' },
    ],
    awards: [
      {
        title: 'Best Marine Electronics Provider 2023',
        year: 2023,
        organization: 'Marine Technology Association',
        category: 'Innovation',
      },
    ],
    socialProof: {
      followers: 15000,
      projectsCompleted: 250,
      yearsInBusiness: 20,
      customerList: ['Superyacht Alpha', 'Megayacht Beta', 'Luxury Yacht Gamma'],
    },
    videoIntroduction: {
      videoUrl: 'https://youtube.com/watch?v=example',
      thumbnailImage: '/media/vendors/elite-intro-thumbnail.jpg',
      title: 'Elite Yacht Systems - Company Overview',
      description: 'Discover how we integrate cutting-edge technology into luxury yachts.',
    },
    caseStudies: [
      {
        title: 'Superyacht Alpha Navigation Upgrade',
        slug: 'superyacht-alpha-navigation',
        client: 'Private Owner',
        challenge: 'Outdated navigation system with limited integration capabilities.',
        solution: 'Complete navigation suite replacement with integrated radar, GPS, and chart plotting.',
        results: 'Improved navigation accuracy by 40% and reduced crew workload.',
        images: ['/media/case-studies/alpha-1.jpg', '/media/case-studies/alpha-2.jpg'],
        technologies: ['NMEA 2000', 'Furuno Radar', 'Garmin Chart Plotters'],
      },
    ],
    innovationHighlights: [
      {
        technology: 'AI-Powered Navigation',
        description: 'Machine learning algorithms for optimal route planning.',
        uniqueApproach: 'Integration with weather data and sea state predictions.',
        benefitsToClients: ['Reduced fuel consumption', 'Improved safety', 'Optimized arrival times'],
      },
    ],
    teamMembers: [
      {
        name: 'John Captain',
        position: 'CEO & Chief Marine Engineer',
        bio: '30 years of experience in marine technology integration.',
        photo: '/media/team/john-captain.jpg',
        linkedinUrl: 'https://linkedin.com/in/johncaptain',
        expertise: ['Marine Electronics', 'System Integration', 'Navigation Systems'],
      },
    ],
    yachtProjects: [
      {
        yachtName: 'Superyacht Alpha',
        systems: ['Navigation', 'Communication', 'Entertainment'],
        projectYear: 2023,
        role: 'Primary Systems Integrator',
        description: 'Complete technology overhaul for 80m superyacht.',
      },
    ],
    published: true,
    featured: true,
  }),
};
```

### Product Fixtures

```typescript
export const productFixtures = {
  /**
   * Basic product with required fields only
   */
  basicProduct: (vendorId: string): Partial<Product> => ({
    name: 'Advanced GPS Navigation System',
    slug: 'advanced-gps-navigation-system',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'State-of-the-art GPS navigation system designed for superyachts.',
              },
            ],
          },
        ],
      },
    },
    shortDescription: 'Professional-grade GPS navigation for luxury yachts',
    vendor: vendorId,
    published: false,
  }),

  /**
   * Full product with images, features, and specifications
   */
  fullProduct: (vendorId: string): Partial<Product> => ({
    name: 'Marine Radar System Pro',
    slug: 'marine-radar-system-pro',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h2',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'Advanced Marine Radar' }],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Professional radar system with 72-mile range and dual-range display.',
              },
            ],
          },
        ],
      },
    },
    shortDescription: '72-mile range professional radar with advanced targeting',
    vendor: vendorId,
    images: [
      {
        url: '/media/products/radar-main.jpg',
        altText: 'Marine Radar System Pro - Front View',
        isMain: true,
        caption: 'Main radar display unit',
      },
      {
        url: '/media/products/radar-installed.jpg',
        altText: 'Marine Radar System Pro - Installed',
        isMain: false,
        caption: 'Radar installed on superyacht',
      },
    ],
    features: [
      {
        title: 'Dual-Range Display',
        description: 'Simultaneously view short and long-range radar data',
        icon: 'Monitor',
        order: 1,
      },
      {
        title: 'Target Tracking',
        description: 'Automatic identification and tracking of up to 100 targets',
        icon: 'Target',
        order: 2,
      },
      {
        title: 'Weather Overlay',
        description: 'Real-time weather data integrated with radar display',
        icon: 'Cloud',
        order: 3,
      },
    ],
    specifications: [
      { label: 'Range', value: '72 nautical miles' },
      { label: 'Power Output', value: '25kW' },
      { label: 'Display Size', value: '19 inch multi-touch' },
      { label: 'Weight', value: '15 kg' },
      { label: 'Operating Temp', value: '-15°C to +55°C' },
      { label: 'IP Rating', value: 'IP67' },
    ],
    published: true,
  }),

  /**
   * Enhanced product with all advanced fields
   */
  enhancedProduct: (vendorId: string): Partial<Product> => ({
    name: 'SmartNav Pro - AI Navigation Suite',
    slug: 'smartnav-pro-ai-navigation-suite',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h1',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'SmartNav Pro' }],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Revolutionary AI-powered navigation system that learns and adapts to your cruising patterns.',
              },
            ],
          },
        ],
      },
    },
    shortDescription: 'AI-powered navigation with predictive routing and automatic optimization',
    vendor: vendorId,
    images: [
      {
        url: '/media/products/smartnav-dashboard.jpg',
        altText: 'SmartNav Pro Dashboard',
        isMain: true,
      },
    ],
    features: [
      {
        title: 'AI Route Planning',
        description: 'Machine learning optimizes routes based on weather, fuel, and preferences',
        icon: 'Brain',
        order: 1,
      },
    ],
    specifications: [
      { label: 'Processor', value: 'Quad-core ARM Cortex-A72' },
      { label: 'Memory', value: '8GB RAM' },
      { label: 'Storage', value: '128GB SSD' },
    ],
    benefits: [
      { benefit: 'Reduces fuel consumption by up to 20%', icon: 'Fuel', order: 1 },
      { benefit: 'Saves 2-3 hours per voyage through optimization', icon: 'Clock', order: 2 },
      { benefit: 'Improves safety with predictive collision avoidance', icon: 'Shield', order: 3 },
    ],
    services: [
      {
        title: 'Professional Installation',
        description: 'Certified technicians install and configure system',
        icon: 'Wrench',
        order: 1,
      },
      {
        title: '24/7 Support',
        description: 'Round-the-clock technical support via satellite link',
        icon: 'Phone',
        order: 2,
      },
    ],
    pricing: {
      displayText: '$25,000 - $35,000',
      subtitle: 'Price varies based on yacht size and configuration',
      showContactForm: true,
      currency: 'USD',
    },
    actionButtons: [
      {
        label: 'Request Quote',
        type: 'primary',
        action: 'quote',
        icon: 'Mail',
        order: 1,
      },
      {
        label: 'Schedule Demo',
        type: 'secondary',
        action: 'contact',
        actionData: 'demo',
        icon: 'Calendar',
        order: 2,
      },
    ],
    badges: [
      { label: 'Best Seller', type: 'success', icon: 'Award', order: 1 },
      { label: 'AI-Powered', type: 'info', icon: 'Cpu', order: 2 },
    ],
    comparisonMetrics: [
      {
        metricId: 'power-consumption',
        name: 'Power Consumption',
        value: 45,
        unit: 'W',
        category: 'efficiency',
        weight: 0.8,
        toleranceMin: 40,
        toleranceMax: 50,
        benchmarkValue: 60,
      },
      {
        metricId: 'accuracy',
        name: 'GPS Accuracy',
        value: 2.5,
        unit: 'meters',
        category: 'performance',
        weight: 1.0,
        benchmarkValue: 5.0,
      },
    ],
    integrationCompatibility: {
      supportedProtocols: ['NMEA 2000', 'NMEA 0183', 'Ethernet'],
      systemRequirements: {
        powerSupply: '12V DC',
        mounting: 'Standard marine rack mount',
        operatingTemp: '-20°C to +60°C',
        certification: 'CE, FCC',
        ipRating: 'IP67',
      },
      compatibilityMatrix: [
        {
          system: 'Garmin',
          compatibility: 'full',
          notes: 'Native integration via NMEA 2000',
          complexity: 'simple',
        },
        {
          system: 'Raymarine',
          compatibility: 'full',
          notes: 'SeaTalk NG compatibility',
          complexity: 'simple',
        },
        {
          system: 'Furuno',
          compatibility: 'adapter',
          notes: 'Requires NMEA 2000 gateway',
          requirements: ['NMEA 2000 Gateway', 'Custom cable'],
          complexity: 'moderate',
          estimatedCost: '$500',
        },
      ],
    },
    ownerReviews: [
      {
        reviewId: 'review-001',
        ownerName: 'Captain James Wilson',
        yachtName: 'Superyacht Aurora',
        yachtLength: '80m',
        rating: 5,
        title: 'Game-Changing Navigation',
        review: 'The AI routing has reduced our fuel costs significantly while improving passage times. Best investment we made.',
        pros: ['Excellent fuel savings', 'Intuitive interface', 'Reliable performance'],
        cons: ['Initial learning curve', 'Premium price'],
        installationDate: '2023-03-15',
        verified: true,
        helpful: 42,
        images: ['/media/reviews/aurora-install.jpg'],
        useCase: 'commercial_charter',
      },
    ],
    visualDemo: {
      type: '360-image',
      title: 'SmartNav Pro - 360° View',
      description: 'Explore the dashboard from all angles',
      imageUrl: '/media/products/smartnav-360.jpg',
      hotspots: [
        {
          positionX: 25,
          positionY: 50,
          title: 'Main Display',
          description: '19-inch multi-touch chart plotter',
          action: 'info',
        },
        {
          positionX: 75,
          positionY: 30,
          title: 'AI Control Panel',
          description: 'AI routing preferences and settings',
          action: 'zoom',
        },
      ],
    },
    published: true,
  }),
};
```

### Yacht Fixtures

```typescript
export const yachtFixtures = {
  /**
   * Basic yacht with required fields
   */
  basicYacht: (): Partial<Yacht> => ({
    name: 'Superyacht Athena',
    slug: 'superyacht-athena',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              { type: 'text', version: 1, text: 'Luxury 80-meter superyacht with state-of-the-art technology.' },
            ],
          },
        ],
      },
    },
    published: true,
  }),

  /**
   * Full yacht with all enhanced fields
   */
  fullYacht: (vendorIds: string[]): Partial<Yacht> => ({
    name: 'Megayacht Poseidon',
    slug: 'megayacht-poseidon',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h1',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'Megayacht Poseidon' }],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              { type: 'text', version: 1, text: 'Award-winning 120-meter megayacht with cutting-edge sustainable technology.' },
            ],
          },
        ],
      },
    },
    image: '/media/yachts/poseidon-main.jpg',
    images: [
      '/media/yachts/poseidon-1.jpg',
      '/media/yachts/poseidon-2.jpg',
      '/media/yachts/poseidon-3.jpg',
    ],
    length: 120,
    beam: 18.5,
    draft: 5.2,
    displacement: 4500,
    builder: 'Oceanco',
    designer: 'Espen Øino',
    launchYear: 2023,
    deliveryYear: 2024,
    homePort: 'Monaco',
    flag: 'Cayman Islands',
    classification: "Lloyd's Register",
    cruisingSpeed: 14,
    maxSpeed: 18,
    range: 6500,
    guests: 24,
    crew: 35,
    timeline: [
      {
        date: '2020-06-15',
        event: 'Contract Signing',
        description: 'Owner signs build contract with Oceanco',
        category: 'milestone',
        location: 'Netherlands',
      },
      {
        date: '2021-03-01',
        event: 'Keel Laying',
        description: 'Official keel laying ceremony',
        category: 'milestone',
        location: 'Oceanco Shipyard',
        images: ['/media/yachts/poseidon-keel-laying.jpg'],
      },
      {
        date: '2023-09-20',
        event: 'Launch',
        description: 'Megayacht Poseidon launched',
        category: 'launch',
        location: 'Alblasserdam, Netherlands',
        images: ['/media/yachts/poseidon-launch-1.jpg', '/media/yachts/poseidon-launch-2.jpg'],
      },
      {
        date: '2024-01-15',
        event: 'Delivery',
        description: 'Official delivery to owner',
        category: 'delivery',
        location: 'Monaco',
      },
    ],
    supplierMap: vendorIds.slice(0, 3).map((vendorId, index) => ({
      vendor: vendorId,
      discipline: ['Electronics & Navigation', 'Lighting Systems', 'Entertainment Systems'][index],
      systems: [
        ['Navigation', 'Radar', 'Communication'],
        ['Underwater Lighting', 'Interior Lighting'],
        ['Cinema', 'Audio Systems'],
      ][index],
      role: ['primary', 'primary', 'subcontractor'][index] as 'primary' | 'subcontractor',
      projectPhase: 'Build & Fit-out',
    })),
    sustainabilityScore: {
      co2Emissions: 12.5,
      energyEfficiency: 1.8,
      wasteManagement: 'excellent',
      waterConservation: 'good',
      materialSustainability: 'excellent',
      overallScore: 92,
      certifications: ['Green Marine', 'ISO 14001', 'Energy Star'],
    },
    customizations: [
      {
        category: 'Sustainable Propulsion',
        description: 'Hybrid diesel-electric propulsion system with battery storage',
        vendor: 'Advanced Marine Propulsion Ltd.',
        cost: '$8,500,000',
        completedDate: '2023-07-15',
        images: ['/media/yachts/poseidon-propulsion.jpg'],
      },
      {
        category: 'Owner Suite',
        description: 'Custom 150m² owner suite with panoramic glass and private balcony',
        vendor: 'Luxury Yacht Interiors Inc.',
        cost: '$3,200,000',
        completedDate: '2023-11-20',
      },
    ],
    maintenanceHistory: [
      {
        date: '2024-03-01',
        type: 'inspection',
        system: 'Propulsion',
        description: 'First post-delivery inspection of hybrid propulsion system',
        vendor: 'Advanced Marine Propulsion Ltd.',
        cost: '$15,000',
        status: 'completed',
        nextService: '2024-09-01',
      },
      {
        date: '2024-05-15',
        type: 'routine',
        system: 'Navigation Electronics',
        description: 'Software updates and system calibration',
        vendor: 'Elite Yacht Systems',
        status: 'completed',
      },
    ],
    published: true,
    featured: true,
  }),
};
```

### Tag, Category, Blog, Team, Company Fixtures

```typescript
export const tagFixtures = {
  basicTag: (): Partial<Tag> => ({
    name: 'Marine Electronics',
    slug: 'marine-electronics',
  }),

  coloredTag: (): Partial<Tag> => ({
    name: 'GPS Navigation',
    slug: 'gps-navigation',
    description: 'GPS and navigation related products and content',
    color: '#0066CC',
  }),
};

export const categoryFixtures = {
  basicCategory: (): Partial<Category> => ({
    name: 'Electronics',
    slug: 'electronics',
  }),

  fullCategory: (): Partial<Category> => ({
    name: 'Navigation Systems',
    slug: 'navigation-systems',
    description: 'Complete navigation solutions for yachts',
    icon: 'Navigation',
    color: '#00A8E8',
    order: 1,
  }),
};

export const blogPostFixtures = {
  basicPost: (authorId: string): Partial<BlogPost> => ({
    title: 'Future of Marine Navigation Technology',
    slug: 'future-marine-navigation-technology',
    excerpt: 'Exploring the latest advancements in marine navigation systems and AI integration.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h1',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'The Future of Marine Navigation' }],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Marine navigation technology is evolving rapidly with AI and machine learning integration.',
              },
            ],
          },
        ],
      },
    },
    author: authorId,
    publishedAt: new Date().toISOString(),
    readTime: '8 min',
  }),

  fullPost: (authorId: string): Partial<BlogPost> => ({
    title: 'AI-Powered Navigation: A Game Changer for Superyachts',
    slug: 'ai-powered-navigation-game-changer',
    excerpt: 'How artificial intelligence is revolutionizing yacht navigation and route planning.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h1',
            version: 1,
            children: [{ type: 'text', version: 1, text: 'AI-Powered Navigation' }],
          },
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Detailed exploration of AI navigation systems...',
              },
            ],
          },
        ],
      },
    },
    author: authorId,
    publishedAt: '2024-01-15T10:00:00Z',
    featuredImage: '/media/blog/ai-navigation-hero.jpg',
    readTime: '12 min',
    seo: {
      metaTitle: 'AI-Powered Navigation for Superyachts | Marine Technology Blog',
      metaDescription: 'Discover how AI is transforming yacht navigation with predictive routing and optimization.',
      keywords: 'AI navigation, superyacht technology, marine electronics, route optimization',
      ogImage: '/media/blog/ai-navigation-og.jpg',
    },
    published: true,
  }),
};

export const teamMemberFixtures = {
  basicMember: (): Partial<TeamMember> => ({
    name: 'John Smith',
    role: 'CEO',
  }),

  fullMember: (): Partial<TeamMember> => ({
    name: 'Sarah Johnson',
    role: 'Chief Technology Officer',
    bio: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Sarah has over 20 years of experience in marine electronics and system integration.',
              },
            ],
          },
        ],
      },
    },
    image: '/media/team/sarah-johnson.jpg',
    email: 'sarah.johnson@company.com',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    order: 2,
  }),
};

export const companyInfoFixture = {
  complete: (): Partial<CompanyInfo> => ({
    name: 'Marine Tech Solutions',
    tagline: 'Innovating the Future of Yacht Technology',
    description: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Leading provider of advanced marine technology solutions for luxury yachts.',
              },
            ],
          },
        ],
      },
    },
    email: 'info@marinetechsolutions.com',
    phone: '+1-555-MARINE',
    founded: 2005,
    location: 'Monaco',
    address: '123 Harbor Drive, Monaco 98000',
    logo: '/media/company/logo.png',
    socialMedia: {
      facebook: 'https://facebook.com/marinetechsolutions',
      twitter: 'https://twitter.com/marinetechsol',
      linkedin: 'https://linkedin.com/company/marine-tech-solutions',
      instagram: 'https://instagram.com/marinetechsolutions',
      youtube: 'https://youtube.com/@marinetechsolutions',
    },
    seo: {
      metaTitle: 'Marine Tech Solutions - Yacht Technology Experts',
      metaDescription: 'Leading provider of marine technology solutions for luxury superyachts worldwide.',
      keywords: 'marine technology, yacht electronics, navigation systems, superyacht technology',
      ogImage: '/media/company/og-image.jpg',
    },
  }),
};
```

---

## 3. Mock Data Generators (`__tests__/utils/mockData.ts`)

```typescript
import type { LexicalDocument } from '@/lib/types';

/**
 * Generate mock Lexical rich text content
 */
export function generateMockRichText(paragraphs: number = 3): LexicalDocument {
  const children = [];

  for (let i = 0; i < paragraphs; i++) {
    children.push({
      type: 'paragraph',
      version: 1,
      children: [
        {
          type: 'text',
          version: 1,
          text: `This is paragraph ${i + 1} of generated rich text content. It contains sample text for testing purposes.`,
        },
      ],
    });
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
    },
  };
}

/**
 * Generate mock image array
 */
export function generateMockImages(count: number = 3): Array<ProductImage> {
  return Array.from({ length: count }, (_, i) => ({
    url: `/media/products/image-${i + 1}.jpg`,
    altText: `Product Image ${i + 1}`,
    isMain: i === 0,
    caption: `Image ${i + 1} caption`,
  }));
}

/**
 * Generate mock certifications array
 */
export function generateMockCertifications(count: number = 3): Array<Certification> {
  const certs = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'NMEA 2000 Certified',
    'CE Certified',
    'FCC Approved',
  ];

  return Array.from({ length: count }, (_, i) => ({
    certification: certs[i % certs.length],
    issuer: 'International Certification Body',
    year: 2023 - i,
  }));
}

/**
 * Generate mock awards array
 */
export function generateMockAwards(count: number = 2): Array<Award> {
  return Array.from({ length: count }, (_, i) => ({
    title: `Industry Award ${2023 - i}`,
    year: 2023 - i,
    organization: 'Marine Technology Association',
    category: 'Innovation',
    description: 'Award for excellence in marine technology innovation.',
  }));
}

/**
 * Generate mock timeline events
 */
export function generateMockTimeline(count: number = 4): Array<TimelineEvent> {
  const categories = ['launch', 'delivery', 'refit', 'milestone', 'service'];

  return Array.from({ length: count }, (_, i) => ({
    date: `2023-${String(i + 1).padStart(2, '0')}-15`,
    event: `Timeline Event ${i + 1}`,
    description: `Description of event ${i + 1}`,
    category: categories[i % categories.length],
    location: 'Monaco',
  }));
}

/**
 * Generate mock supplier map
 */
export function generateMockSupplierMap(vendorIds: string[]): Array<SupplierMapEntry> {
  const disciplines = ['Electronics', 'Lighting', 'Entertainment', 'HVAC'];
  const roles = ['primary', 'subcontractor', 'consultant'];

  return vendorIds.slice(0, 4).map((vendorId, i) => ({
    vendor: vendorId,
    discipline: disciplines[i % disciplines.length],
    systems: [`System ${i + 1}A`, `System ${i + 1}B`],
    role: roles[i % roles.length] as 'primary' | 'subcontractor' | 'consultant',
    projectPhase: 'Build',
  }));
}

/**
 * Generate mock owner reviews
 */
export function generateMockOwnerReviews(count: number = 3): Array<OwnerReview> {
  return Array.from({ length: count }, (_, i) => ({
    reviewId: `review-${String(i + 1).padStart(3, '0')}`,
    ownerName: `Owner ${i + 1}`,
    yachtName: `Superyacht ${['Alpha', 'Beta', 'Gamma'][i % 3]}`,
    yachtLength: `${70 + i * 10}m`,
    rating: 4 + (i % 2),
    title: `Great Product ${i + 1}`,
    review: `This is a detailed review of the product. Very satisfied with the performance and quality.`,
    pros: ['Excellent quality', 'Great performance', 'Good value'],
    cons: ['Price could be lower'],
    installationDate: `2023-0${i + 1}-15`,
    verified: true,
    helpful: 10 + i * 5,
    useCase: ['commercial_charter', 'private_use', 'expedition'][i % 3],
  }));
}

/**
 * Generate mock specifications
 */
export function generateMockSpecifications(): Array<Specification> {
  return [
    { label: 'Power', value: '12V DC' },
    { label: 'Weight', value: '2.5 kg' },
    { label: 'Dimensions', value: '300mm x 200mm x 100mm' },
    { label: 'Operating Temp', value: '-20°C to +60°C' },
    { label: 'IP Rating', value: 'IP67' },
  ];
}

/**
 * Generate mock features
 */
export function generateMockFeatures(count: number = 5): Array<Feature> {
  const icons = ['Zap', 'Shield', 'Cpu', 'Radio', 'Wifi'];

  return Array.from({ length: count }, (_, i) => ({
    title: `Feature ${i + 1}`,
    description: `Description of feature ${i + 1}`,
    icon: icons[i % icons.length],
    order: i + 1,
  }));
}

/**
 * Generate random hex color
 */
export function generateRandomColor(): string {
  const colors = ['#0066CC', '#00A8E8', '#FF6B35', '#4ECDC4', '#FF5733', '#C70039'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generate random slug
 */
export function generateRandomSlug(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
```

---

## Usage Examples

### Example Test Using Fixtures

```typescript
import { setupTestDatabase, createTestVendor } from '../utils/testHelpers';
import { productFixtures } from '../utils/fixtures';

describe('Products Collection', () => {
  const { getPayload } = setupTestDatabase();

  it('should create product with full fixture', async () => {
    const payload = getPayload();
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.fullProduct(vendor.id),
    });

    expect(product.name).toBe('Marine Radar System Pro');
    expect(product.features).toHaveLength(3);
    expect(product.specifications).toHaveLength(6);
  });
});
```

### Example Test Using Mock Generators

```typescript
import { generateMockRichText, generateMockImages } from '../utils/mockData';

describe('Rich Text Generation', () => {
  it('should generate valid Lexical document', () => {
    const richText = generateMockRichText(5);

    expect(richText.root.children).toHaveLength(5);
    expect(richText.root.children[0].type).toBe('paragraph');
  });

  it('should generate product images', () => {
    const images = generateMockImages(3);

    expect(images).toHaveLength(3);
    expect(images[0].isMain).toBe(true);
    expect(images[0].url).toMatch(/^\/media\//);
  });
});
```

---

## Notes

- All fixtures provide realistic, production-ready test data
- Fixtures are functions that accept IDs for relationships
- Mock generators create random data for property-based testing
- Test helpers simplify database setup/teardown and assertions
- In-memory SQLite database ensures fast test execution
- Fixtures cover all 8 collections with basic, full, and enhanced variants
- Rich text generation follows Lexical JSON format
- All image paths use `/media/` prefix for consistency
