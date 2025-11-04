import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Seed Complete Test Vendors
 *
 * Creates test vendors with COMPLETE profiles across all tiers
 * to properly test tier-based rendering and features.
 *
 * Usage: tsx scripts/seed-complete-test-vendors.ts
 */

async function seedCompleteVendors() {
  const payload = await getPayload({ config });

  console.log('🌱 Seeding complete test vendor profiles...\n');

  // Test vendor configurations with complete data
  const testVendors = [
    {
      // FREE TIER - Minimal profile
      email: 'testvendor-free@test.com',
      password: 'TestVendor123!Free',
      tier: 'free' as const,
      data: {
        companyName: 'Free Tier Test Vendor',
        slug: 'testvendor-free',
        contactEmail: 'testvendor-free@test.com',
        description: 'Basic marine equipment supplier offering essential products and services.',
        published: true,
        featured: false,
        // Free tier: Only basic fields
      },
    },
    {
      // TIER 1 - Enhanced profile
      email: 'testvendor-tier1@test.com',
      password: 'TestVendor123!Tier1',
      tier: 'tier1' as const,
      data: {
        companyName: 'Tier 1 Professional Vendor',
        slug: 'testvendor-tier1',
        contactEmail: 'testvendor-tier1@test.com',
        description: 'Professional marine technology provider with 15 years of industry experience.',
        longDescription: 'We are a professional marine technology provider specializing in advanced navigation systems, communication equipment, and safety solutions for superyachts. Our team brings over 15 years of combined experience in the maritime industry, serving clients worldwide with cutting-edge technology and exceptional service.',
        foundedYear: 2010,
        website: 'https://tier1vendor.example.com',
        published: true,
        featured: false,
        // Tier 1+: Extended fields
        socialLinks: {
          linkedin: 'https://linkedin.com/company/tier1vendor',
          twitter: 'https://twitter.com/tier1vendor',
        },
        serviceAreas: [
          { area: 'Navigation Systems', description: 'Advanced GPS and navigation solutions' },
          { area: 'Communication Equipment', description: 'Satellite and radio communication systems' },
          { area: 'Safety Solutions', description: 'Comprehensive safety equipment and training' },
        ],
        companyValues: [
          { value: 'Innovation', description: 'Pioneering new technologies and solutions' },
          { value: 'Quality', description: 'Uncompromising commitment to excellence' },
          { value: 'Customer Service', description: '24/7 support for our clients' },
          { value: 'Reliability', description: 'Dependable performance you can trust' },
        ],
      },
    },
    {
      // TIER 2 - Professional profile
      email: 'testvendor-tier2@test.com',
      password: 'TestVendor123!Tier2',
      tier: 'tier2' as const,
      data: {
        companyName: 'Tier 2 Professional Vendor',
        slug: 'testvendor-tier2',
        contactEmail: 'testvendor-tier2@test.com',
        description: 'Leading superyacht technology integrator with 20 years of excellence and 150+ successful projects.',
        longDescription: 'As a leading superyacht technology integrator, we specialize in delivering comprehensive solutions for the world\'s most sophisticated vessels. With over 20 years of experience and 150+ successful projects, our team of certified engineers provides end-to-end services from system design to installation and ongoing support. We partner with the industry\'s top manufacturers to ensure our clients receive the best technology solutions available.',
        foundedYear: 2005,
        website: 'https://tier2vendor.example.com',
        published: true,
        featured: true,
        // Tier 2+: Professional features
        socialLinks: {
          linkedin: 'https://linkedin.com/company/tier2vendor',
          twitter: 'https://twitter.com/tier2vendor',
          facebook: 'https://facebook.com/tier2vendor',
          instagram: 'https://instagram.com/tier2vendor',
        },
        serviceAreas: [
          { area: 'System Integration', description: 'Complete IT/AV system integration services' },
          { area: 'Network Infrastructure', description: 'Enterprise-grade network design and deployment' },
          { area: 'AV Systems', description: 'State-of-the-art audio and visual solutions' },
          { area: 'Automation', description: 'Smart yacht automation and control systems' },
        ],
        companyValues: [
          { value: 'Excellence', description: 'Delivering exceptional results every time' },
          { value: 'Innovation', description: 'Leading the industry with cutting-edge solutions' },
          { value: 'Partnership', description: 'Building long-term relationships' },
          { value: 'Integrity', description: 'Honest and transparent in all dealings' },
        ],
        totalProjects: 150,
        totalClients: 85,
        globalPresence: 12,
      },
    },
    {
      // TIER 3 - Premium profile
      email: 'testvendor-tier3@test.com',
      password: 'TestVendor123!Tier3',
      tier: 'tier3' as const,
      data: {
        companyName: 'Tier 3 Premium Vendor',
        slug: 'testvendor-tier3',
        contactEmail: 'testvendor-tier3@test.com',
        description: 'Premier superyacht technology solutions provider with 25 years of industry leadership, 500+ projects, and worldwide presence.',
        longDescription: 'We are the premier superyacht technology solutions provider, setting industry standards for innovation and excellence for over 25 years. Our portfolio includes 500+ completed projects across 40+ countries, serving the world\'s most prestigious yachts. Our team of 150+ specialized engineers and technicians delivers turnkey solutions encompassing IT/AV, navigation, communication, security, and automation systems. We maintain strategic partnerships with leading manufacturers and provide 24/7 global support to ensure our clients receive unparalleled service and technology solutions.',
        foundedYear: 2000,
        website: 'https://tier3vendor.example.com',
        published: true,
        featured: true,
        // Tier 3: Premium features
        socialLinks: {
          linkedin: 'https://linkedin.com/company/tier3vendor',
          twitter: 'https://twitter.com/tier3vendor',
          facebook: 'https://facebook.com/tier3vendor',
          instagram: 'https://instagram.com/tier3vendor',
          youtube: 'https://youtube.com/c/tier3vendor',
        },
        serviceAreas: [
          { area: 'IT/AV Systems', description: 'Complete IT and audio-visual solutions' },
          { area: 'Navigation', description: 'Advanced navigation and positioning systems' },
          { area: 'Communication', description: 'Satellite, cellular, and radio communications' },
          { area: 'Security', description: 'Comprehensive security and surveillance systems' },
          { area: 'Automation', description: 'Intelligent automation and control platforms' },
          { area: 'Network Infrastructure', description: 'Enterprise network architecture' },
        ],
        companyValues: [
          { value: 'Leadership', description: 'Setting industry standards' },
          { value: 'Innovation', description: 'Pioneering next-generation technology' },
          { value: 'Excellence', description: 'Unmatched quality and performance' },
          { value: 'Global Service', description: '24/7 support worldwide' },
          { value: 'Partnership', description: 'Strategic alliances with industry leaders' },
        ],
        totalProjects: 500,
        totalClients: 250,
        globalPresence: 40,
        videoIntroduction: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        // Tier 3 promotion pack (would be set by admin)
        promotionPack: {
          featuredInNewsletter: true,
          featuredOnHomepage: true,
          priorityListing: true,
          socialMediaPromotion: true,
          blogFeatureArticle: true,
        },
      },
    },
  ];

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const vendor of testVendors) {
    try {
      console.log(`Processing ${vendor.email}...`);

      // Find or create user
      let user;
      const users = await payload.find({
        collection: 'users',
        where: { email: { equals: vendor.email } },
        limit: 1,
      });

      if (users.docs.length > 0) {
        user = users.docs[0];
        console.log(`  ✓ User exists`);
      } else {
        user = await payload.create({
          collection: 'users',
          data: {
            email: vendor.email,
            password: vendor.password,
            role: 'vendor',
            status: 'approved',
          },
        });
        console.log(`  ✓ User created`);
      }

      // Find or create vendor
      const vendors = await payload.find({
        collection: 'vendors',
        where: { user: { equals: user.id } },
        limit: 1,
      });

      const vendorData = {
        ...vendor.data,
        user: user.id,
        tier: vendor.tier,
      };

      if (vendors.docs.length > 0) {
        await payload.update({
          collection: 'vendors',
          id: vendors.docs[0].id,
          data: vendorData,
        });
        console.log(`  ✅ Vendor updated with complete profile (${vendor.tier})`);
        updated++;
      } else {
        await payload.create({
          collection: 'vendors',
          data: vendorData,
        });
        console.log(`  ✅ Vendor created with complete profile (${vendor.tier})`);
        created++;
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`\n✅ Test vendor seeding complete!`);
  console.log(`\n💡 Note: Logos must be uploaded via the CMS admin interface or using media upload scripts.`);
  console.log(`   Visit http://localhost:3000/admin to upload vendor logos.`);

  process.exit(0);
}

seedCompleteVendors().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
