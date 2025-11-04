import { getPayload } from 'payload';
import config from '../payload.config';

/**
 * Seed Production-Ready Vendor Profiles
 *
 * Creates a comprehensive set of vendors with complete profiles across all tiers.
 * Includes realistic company data, descriptions, logos (placeholders), and tier-specific features.
 *
 * Usage: tsx scripts/seed-production-vendors.ts
 */

async function seedProductionVendors() {
  const payload = await getPayload({ config });

  console.log('🌱 Seeding production-ready vendor profiles...\n');

  // Comprehensive vendor dataset
  const vendors = [
    // ====== FREE TIER VENDORS (6 vendors) ======
    {
      email: 'contact@nautictech.example.com',
      password: 'NauticTech2024!',
      tier: 'free' as const,
      companyName: 'NauticTech Solutions',
      slug: 'nautictech-solutions',
      description: 'Marine electronics and navigation systems for recreational and commercial vessels.',
      contactEmail: 'contact@nautictech.example.com',
      website: 'https://nautictech.example.com',
      published: true,
      featured: false,
    },
    {
      email: 'info@oceanwave.example.com',
      password: 'OceanWave2024!',
      tier: 'free' as const,
      companyName: 'OceanWave Marine',
      slug: 'oceanwave-marine',
      description: 'Supplier of marine hardware, rigging equipment, and deck accessories.',
      contactEmail: 'info@oceanwave.example.com',
      published: true,
      featured: false,
    },
    {
      email: 'sales@aquasystems.example.com',
      password: 'AquaSystems2024!',
      tier: 'free' as const,
      companyName: 'AquaSystems International',
      slug: 'aquasystems-international',
      description: 'Water treatment and purification systems for marine applications.',
      contactEmail: 'sales@aquasystems.example.com',
      published: true,
      featured: false,
    },
    {
      email: 'hello@marineaudio.example.com',
      password: 'MarineAudio2024!',
      tier: 'free' as const,
      companyName: 'MarineAudio Pro',
      slug: 'marineaudio-pro',
      description: 'Professional marine audio and entertainment systems.',
      contactEmail: 'hello@marineaudio.example.com',
      published: true,
      featured: false,
    },
    {
      email: 'contact@yachtlighting.example.com',
      password: 'YachtLighting2024!',
      tier: 'free' as const,
      companyName: 'Yacht Lighting Systems',
      slug: 'yacht-lighting-systems',
      description: 'LED lighting solutions and underwater illumination for luxury yachts.',
      contactEmail: 'contact@yachtlighting.example.com',
      published: true,
      featured: false,
    },
    {
      email: 'info@decksolutions.example.com',
      password: 'DeckSolutions2024!',
      tier: 'free' as const,
      companyName: 'DeckSolutions Ltd',
      slug: 'decksolutions-ltd',
      description: 'Premium teak decking and marine flooring solutions.',
      contactEmail: 'info@decksolutions.example.com',
      published: true,
      featured: false,
    },

    // ====== TIER 1 VENDORS (5 vendors) ======
    {
      email: 'sales@navtech-marine.example.com',
      password: 'NavTechMarine2024!',
      tier: 'tier1' as const,
      companyName: 'NavTech Marine Systems',
      slug: 'navtech-marine-systems',
      description: 'Advanced navigation, radar, and GPS systems for superyachts worldwide.',
      longDescription: 'NavTech Marine Systems has been at the forefront of marine navigation technology for over 15 years. We specialize in providing integrated navigation solutions combining radar, GPS, AIS, and chartplotting systems for the world\'s finest superyachts. Our certified technicians ensure seamless installation and provide ongoing support to keep your vessel navigating safely and efficiently.',
      foundedYear: 2010,
      website: 'https://navtech-marine.example.com',
      contactEmail: 'sales@navtech-marine.example.com',
      linkedinUrl: 'https://linkedin.com/company/navtech-marine',
      twitterUrl: 'https://twitter.com/navtechmarine',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'Navigation Systems', description: 'Integrated GPS, radar, and chartplotting solutions' },
        { area: 'Radar Installation', description: 'Commercial and recreational radar systems' },
        { area: 'AIS Integration', description: 'Automatic Identification System solutions' },
      ],
      companyValues: [
        { value: 'Precision', description: 'Accuracy in every installation' },
        { value: 'Reliability', description: '24/7 navigation safety' },
        { value: 'Innovation', description: 'Latest navigation technology' },
      ],
      totalProjects: 75,
    },
    {
      email: 'contact@yachtcomm.example.com',
      password: 'YachtComm2024!',
      tier: 'tier1' as const,
      companyName: 'YachtComm Technologies',
      slug: 'yachtcomm-technologies',
      description: 'Satellite communication and internet connectivity solutions for superyachts.',
      longDescription: 'YachtComm Technologies delivers cutting-edge satellite communication solutions to ensure superyachts stay connected anywhere in the world. With 12 years of industry experience, we provide VSAT, 4G/5G, and LEO satellite systems with seamless failover capabilities. Our solutions enable owners and guests to enjoy high-speed internet, video conferencing, and streaming services while cruising the world\'s oceans.',
      foundedYear: 2013,
      website: 'https://yachtcomm.example.com',
      contactEmail: 'contact@yachtcomm.example.com',
      linkedinUrl: 'https://linkedin.com/company/yachtcomm',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'VSAT Systems', description: 'High-speed satellite internet' },
        { area: '4G/5G Connectivity', description: 'Cellular data aggregation' },
        { area: 'Network Design', description: 'Yacht-wide network infrastructure' },
      ],
      companyValues: [
        { value: 'Connectivity', description: 'Always connected, anywhere' },
        { value: 'Performance', description: 'High-speed reliable service' },
        { value: 'Support', description: 'Global technical assistance' },
      ],
      totalProjects: 62,
    },
    {
      email: 'hello@marineavtech.example.com',
      password: 'MarineAVTech2024!',
      tier: 'tier1' as const,
      companyName: 'Marine AV Technologies',
      slug: 'marine-av-technologies',
      description: 'Premium audio-visual systems and home theater solutions for luxury yachts.',
      longDescription: 'Marine AV Technologies creates immersive entertainment experiences for superyacht owners and their guests. Our team of certified AV specialists designs and installs custom home theaters, distributed audio systems, and outdoor entertainment areas. We work with leading brands like Bang & Olufsen, Bose, and Crestron to deliver exceptional sound quality and intuitive control systems.',
      foundedYear: 2015,
      website: 'https://marineavtech.example.com',
      contactEmail: 'hello@marineavtech.example.com',
      linkedinUrl: 'https://linkedin.com/company/marineavtech',
      twitterUrl: 'https://twitter.com/marineavtech',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'Home Theaters', description: 'Custom cinema room design and installation' },
        { area: 'Distributed Audio', description: 'Multi-zone audio systems' },
        { area: 'Control Systems', description: 'Crestron and Lutron automation' },
      ],
      companyValues: [
        { value: 'Excellence', description: 'Premium quality installations' },
        { value: 'Innovation', description: 'Latest AV technology' },
        { value: 'Customization', description: 'Tailored to client needs' },
      ],
      totalProjects: 48,
    },
    {
      email: 'sales@yachtautomation.example.com',
      password: 'YachtAutomation2024!',
      tier: 'tier1' as const,
      companyName: 'Yacht Automation Specialists',
      slug: 'yacht-automation-specialists',
      description: 'Smart yacht automation, lighting control, and climate management systems.',
      longDescription: 'Yacht Automation Specialists brings the latest smart home technology to the marine environment. Our solutions integrate lighting, climate control, blinds, and security systems into unified, easy-to-use control platforms. With 10 years of experience, we\'ve automated over 55 superyachts, providing owners with effortless control via touchscreens, tablets, and smartphones.',
      foundedYear: 2015,
      website: 'https://yachtautomation.example.com',
      contactEmail: 'sales@yachtautomation.example.com',
      linkedinUrl: 'https://linkedin.com/company/yachtautomation',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'Lighting Control', description: 'Automated lighting scenes and dimming' },
        { area: 'Climate Management', description: 'HVAC automation and monitoring' },
        { area: 'Window Treatments', description: 'Automated blinds and shades' },
      ],
      companyValues: [
        { value: 'Simplicity', description: 'Intuitive user interfaces' },
        { value: 'Integration', description: 'Seamless system integration' },
        { value: 'Reliability', description: 'Robust marine-grade systems' },
      ],
      totalProjects: 55,
    },
    {
      email: 'contact@securewave.example.com',
      password: 'SecureWave2024!',
      tier: 'tier1' as const,
      companyName: 'SecureWave Marine Security',
      slug: 'securewave-marine-security',
      description: 'Comprehensive security systems including CCTV, access control, and monitoring.',
      longDescription: 'SecureWave Marine Security protects the world\'s most valuable yachts with state-of-the-art security solutions. Our comprehensive systems include HD CCTV cameras, biometric access control, perimeter detection, and 24/7 remote monitoring. With 18 years in the security industry and 8 years specializing in marine applications, we understand the unique challenges of yacht security.',
      foundedYear: 2017,
      website: 'https://securewave.example.com',
      contactEmail: 'contact@securewave.example.com',
      linkedinUrl: 'https://linkedin.com/company/securewave',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'CCTV Systems', description: '4K camera systems with recording' },
        { area: 'Access Control', description: 'Biometric and card-based systems' },
        { area: 'Monitoring', description: '24/7 remote security monitoring' },
      ],
      companyValues: [
        { value: 'Security', description: 'Maximum protection for assets' },
        { value: 'Discretion', description: 'Unobtrusive system design' },
        { value: 'Vigilance', description: 'Constant monitoring and alerts' },
      ],
      totalProjects: 42,
    },

    // ====== TIER 2 VENDORS (4 vendors) ======
    {
      email: 'sales@superyacht-integration.example.com',
      password: 'SuperyachtInt2024!',
      tier: 'tier2' as const,
      companyName: 'Superyacht Integration Solutions',
      slug: 'superyacht-integration-solutions',
      description: 'Full-service IT/AV integration for superyachts with 20 years of excellence and 150+ projects.',
      longDescription: 'Superyacht Integration Solutions is a leading provider of comprehensive IT and AV systems for the world\'s finest superyachts. With over 20 years of experience and 150+ successful projects, we deliver turnkey solutions encompassing network infrastructure, entertainment systems, automation, and security. Our team of 35+ certified engineers works globally to ensure our clients receive the highest quality installations and ongoing support.',
      foundedYear: 2005,
      website: 'https://superyacht-integration.example.com',
      contactEmail: 'sales@superyacht-integration.example.com',
      linkedinUrl: 'https://linkedin.com/company/superyacht-integration',
      twitterUrl: 'https://twitter.com/syintegration',
      facebookUrl: 'https://facebook.com/superyachtintegration',
      published: true,
      featured: true,
      serviceAreas: [
        { area: 'Network Infrastructure', description: 'Enterprise-grade network design and implementation' },
        { area: 'AV Systems', description: 'Premium audio-visual solutions' },
        { area: 'IT Systems', description: 'Server and storage infrastructure' },
        { area: 'Automation', description: 'Integrated control systems' },
      ],
      companyValues: [
        { value: 'Excellence', description: 'Uncompromising quality standards' },
        { value: 'Innovation', description: 'Leading-edge technology' },
        { value: 'Partnership', description: 'Long-term client relationships' },
        { value: 'Reliability', description: 'Dependable systems and support' },
      ],
      totalProjects: 150,
      totalClients: 95,
      globalPresence: 15,
      clientSatisfactionScore: 9.2,
      repeatClientPercentage: 78,
    },
    {
      email: 'hello@maritime-technology.example.com',
      password: 'MaritimeTech2024!',
      tier: 'tier2' as const,
      companyName: 'Maritime Technology Partners',
      slug: 'maritime-technology-partners',
      description: 'Advanced marine systems integration specializing in navigation, communication, and monitoring.',
      longDescription: 'Maritime Technology Partners delivers state-of-the-art integrated systems for commercial and private superyachts. Our expertise spans navigation, communication, monitoring, and control systems. With 18 years in the industry and 120+ projects completed, we\'re trusted by yacht owners and captains worldwide. Our team combines deep technical knowledge with practical marine experience to deliver reliable, user-friendly solutions.',
      foundedYear: 2007,
      website: 'https://maritime-technology.example.com',
      contactEmail: 'hello@maritime-technology.example.com',
      linkedinUrl: 'https://linkedin.com/company/maritime-technology-partners',
      twitterUrl: 'https://twitter.com/maritimetech',
      published: true,
      featured: true,
      serviceAreas: [
        { area: 'Navigation Integration', description: 'Complete bridge systems' },
        { area: 'GMDSS Communication', description: 'Safety communication systems' },
        { area: 'Monitoring Systems', description: 'Engine and systems monitoring' },
        { area: 'Bridge Design', description: 'Custom bridge layout and ergonomics' },
      ],
      companyValues: [
        { value: 'Safety', description: 'Safety-first system design' },
        { value: 'Expertise', description: 'Deep marine technology knowledge' },
        { value: 'Quality', description: 'Premium component selection' },
        { value: 'Service', description: 'Worldwide support network' },
      ],
      totalProjects: 120,
      totalClients: 72,
      globalPresence: 12,
      clientSatisfactionScore: 9.0,
      repeatClientPercentage: 71,
    },
    {
      email: 'contact@yachtmedia.example.com',
      password: 'YachtMedia2024!',
      tier: 'tier2' as const,
      companyName: 'Yacht Media Systems',
      slug: 'yacht-media-systems',
      description: 'Premium entertainment and media distribution systems for luxury superyachts.',
      longDescription: 'Yacht Media Systems creates world-class entertainment experiences for superyacht owners and guests. We design and install comprehensive media distribution systems, satellite TV, streaming services, and gaming platforms. Our solutions integrate seamlessly with yacht management systems and provide intuitive control via custom interfaces. With 15 years of experience and 110+ installations, we\'re the preferred choice for entertainment-focused yacht owners.',
      foundedYear: 2010,
      website: 'https://yachtmedia.example.com',
      contactEmail: 'contact@yachtmedia.example.com',
      linkedinUrl: 'https://linkedin.com/company/yachtmedia',
      instagramUrl: 'https://instagram.com/yachtmediasystems',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'Media Distribution', description: 'HDMI/4K video distribution' },
        { area: 'Satellite TV', description: 'Multi-region satellite reception' },
        { area: 'Streaming Integration', description: 'Netflix, Spotify, etc.' },
        { area: 'Gaming Systems', description: 'Multi-room gaming setup' },
      ],
      companyValues: [
        { value: 'Entertainment', description: 'Creating memorable experiences' },
        { value: 'Technology', description: 'Latest media technology' },
        { value: 'Design', description: 'Aesthetic system integration' },
        { value: 'Performance', description: 'Flawless media delivery' },
      ],
      totalProjects: 110,
      totalClients: 68,
      globalPresence: 8,
      clientSatisfactionScore: 8.9,
    },
    {
      email: 'sales@oceantech-systems.example.com',
      password: 'OceanTechSys2024!',
      tier: 'tier2' as const,
      companyName: 'OceanTech Systems',
      slug: 'oceantech-systems',
      description: 'Integrated marine systems provider specializing in network, security, and automation solutions.',
      longDescription: 'OceanTech Systems provides comprehensive IT and automation solutions tailored for the marine environment. Our expertise includes enterprise network design, cybersecurity, surveillance systems, and yacht-wide automation. With 16 years of experience and 130+ projects, we serve both new builds and refits. Our global team of 28+ specialists ensures projects are delivered on time and exceed client expectations.',
      foundedYear: 2009,
      website: 'https://oceantech-systems.example.com',
      contactEmail: 'sales@oceantech-systems.example.com',
      linkedinUrl: 'https://linkedin.com/company/oceantech-systems',
      twitterUrl: 'https://twitter.com/oceantechsys',
      published: true,
      featured: false,
      serviceAreas: [
        { area: 'Network Security', description: 'Firewalls and cybersecurity' },
        { area: 'Surveillance', description: 'IP camera systems' },
        { area: 'IT Infrastructure', description: 'Servers and data storage' },
        { area: 'System Integration', description: 'Unified platform solutions' },
      ],
      companyValues: [
        { value: 'Security', description: 'Protecting digital assets' },
        { value: 'Performance', description: 'High-performance networks' },
        { value: 'Scalability', description: 'Future-proof systems' },
        { value: 'Excellence', description: 'Premium installations' },
      ],
      totalProjects: 130,
      totalClients: 81,
      globalPresence: 10,
      clientSatisfactionScore: 9.1,
      repeatClientPercentage: 75,
    },

    // ====== TIER 3 VENDORS (3 vendors) ======
    {
      email: 'sales@superyacht-systems-global.example.com',
      password: 'SSGlobal2024!',
      tier: 'tier3' as const,
      companyName: 'Superyacht Systems Global',
      slug: 'superyacht-systems-global',
      description: 'Premier global provider of integrated superyacht technology with 25 years of industry leadership and 500+ projects.',
      longDescription: 'Superyacht Systems Global is the world\'s leading provider of comprehensive technology solutions for superyachts. With 25 years of experience and 500+ completed projects across 40+ countries, we set the industry standard for innovation and excellence. Our team of 150+ specialized engineers delivers turnkey solutions encompassing IT/AV, navigation, communication, security, and automation systems. We maintain strategic partnerships with industry-leading manufacturers and provide 24/7 global support, ensuring our clients receive unparalleled service and technology solutions.',
      foundedYear: 2000,
      website: 'https://superyacht-systems-global.example.com',
      contactEmail: 'sales@superyacht-systems-global.example.com',
      linkedinUrl: 'https://linkedin.com/company/superyacht-systems-global',
      twitterUrl: 'https://twitter.com/ssglobal',
      facebookUrl: 'https://facebook.com/superyachtsystemsglobal',
      instagramUrl: 'https://instagram.com/ssglobal',
      youtubeUrl: 'https://youtube.com/c/superyachtsystemsglobal',
      published: true,
      featured: true,
      serviceAreas: [
        { area: 'IT/AV Integration', description: 'Complete technology infrastructure' },
        { area: 'Navigation Systems', description: 'Bridge and helm systems' },
        { area: 'Communication', description: 'VSAT, 4G/5G, radio systems' },
        { area: 'Security', description: 'CCTV, access control, monitoring' },
        { area: 'Automation', description: 'Integrated control platforms' },
        { area: 'Network Infrastructure', description: 'Enterprise-grade networks' },
      ],
      companyValues: [
        { value: 'Leadership', description: 'Setting industry standards' },
        { value: 'Innovation', description: 'Pioneering new technology' },
        { value: 'Excellence', description: 'Unmatched quality' },
        { value: 'Global Service', description: '24/7 worldwide support' },
        { value: 'Partnership', description: 'Strategic manufacturer alliances' },
      ],
      totalProjects: 500,
      totalClients: 250,
      globalPresence: 40,
      employeeCount: 150,
      clientSatisfactionScore: 9.5,
      repeatClientPercentage: 85,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoTitle: 'Superyacht Systems Global - Company Overview',
      videoDescription: 'Discover how we deliver world-class technology solutions to the superyacht industry.',
      promotionPack: {
        homepageBanner: true,
        searchResultsPriority: 95,
        categoryTopPlacement: true,
        sponsoredContent: true,
        monthlyFeaturedArticle: true,
        socialMediaShoutouts: 4,
        emailNewsletterFeature: true,
      },
    },
    {
      email: 'contact@marine-tech-innovations.example.com',
      password: 'MTInnovations2024!',
      tier: 'tier3' as const,
      companyName: 'Marine Tech Innovations',
      slug: 'marine-tech-innovations',
      description: 'Award-winning technology integrator specializing in luxury superyacht systems with 22 years of excellence.',
      longDescription: 'Marine Tech Innovations has been delivering cutting-edge technology solutions to the superyacht industry for over 22 years. With 400+ projects completed across 35 countries, we\'ve earned our reputation as one of the industry\'s most innovative and reliable partners. Our team of 120+ engineers combines deep technical expertise with creative problem-solving to deliver systems that exceed client expectations. We specialize in complex integrations, custom software development, and bespoke automation solutions. Our commitment to innovation has earned us multiple industry awards and the trust of the world\'s most discerning yacht owners.',
      foundedYear: 2003,
      website: 'https://marine-tech-innovations.example.com',
      contactEmail: 'contact@marine-tech-innovations.example.com',
      linkedinUrl: 'https://linkedin.com/company/marine-tech-innovations',
      twitterUrl: 'https://twitter.com/marinetechinno',
      facebookUrl: 'https://facebook.com/marinetechinnovations',
      instagramUrl: 'https://instagram.com/marinetechinnovations',
      youtubeUrl: 'https://youtube.com/c/marinetechinnovations',
      published: true,
      featured: true,
      serviceAreas: [
        { area: 'Custom Integration', description: 'Bespoke technology solutions' },
        { area: 'Software Development', description: 'Custom control interfaces' },
        { area: 'Advanced Automation', description: 'AI-powered smart systems' },
        { area: 'Network Architecture', description: 'High-performance networks' },
        { area: 'AV Excellence', description: 'Premium entertainment systems' },
      ],
      companyValues: [
        { value: 'Innovation', description: 'Pushing technological boundaries' },
        { value: 'Craftsmanship', description: 'Attention to every detail' },
        { value: 'Excellence', description: 'Never settling for good enough' },
        { value: 'Passion', description: 'Love for what we do' },
      ],
      totalProjects: 400,
      totalClients: 220,
      globalPresence: 35,
      employeeCount: 120,
      clientSatisfactionScore: 9.4,
      repeatClientPercentage: 82,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoTitle: 'Innovation in Motion - Marine Tech Innovations',
      videoDescription: 'See how we bring innovation to every project.',
      promotionPack: {
        homepageBanner: false,
        searchResultsPriority: 90,
        categoryTopPlacement: true,
        sponsoredContent: true,
        monthlyFeaturedArticle: true,
        socialMediaShoutouts: 3,
        emailNewsletterFeature: true,
      },
    },
    {
      email: 'info@elite-yacht-technology.example.com',
      password: 'EliteYachtTech2024!',
      tier: 'tier3' as const,
      companyName: 'Elite Yacht Technology',
      slug: 'elite-yacht-technology',
      description: 'Boutique technology integrator serving the world\'s most exclusive superyachts with personalized service.',
      longDescription: 'Elite Yacht Technology is a boutique technology integrator specializing in ultra-personalized service for the world\'s most exclusive superyachts. Founded 20 years ago, we\'ve completed 300+ projects for discerning owners who demand perfection. Our approach combines technical excellence with white-glove service, ensuring every detail exceeds expectations. With a team of 85+ specialists and offices in Monaco, Fort Lauderdale, and Singapore, we provide truly global coverage. Our client-first philosophy has earned us a 90% repeat client rate and industry-leading satisfaction scores.',
      foundedYear: 2005,
      website: 'https://elite-yacht-technology.example.com',
      contactEmail: 'info@elite-yacht-technology.example.com',
      linkedinUrl: 'https://linkedin.com/company/elite-yacht-technology',
      twitterUrl: 'https://twitter.com/eliteyachtech',
      instagramUrl: 'https://instagram.com/eliteyachttechnology',
      youtubeUrl: 'https://youtube.com/c/eliteyachttechnology',
      published: true,
      featured: true,
      serviceAreas: [
        { area: 'Concierge Service', description: 'Dedicated account managers' },
        { area: 'Luxury AV', description: 'Bespoke entertainment systems' },
        { area: 'Smart Yacht', description: 'Intelligent automation' },
        { area: 'Cybersecurity', description: 'Enterprise-grade protection' },
      ],
      companyValues: [
        { value: 'Exclusivity', description: 'Serving elite clientele' },
        { value: 'Perfection', description: 'Flawless execution' },
        { value: 'Discretion', description: 'Absolute confidentiality' },
        { value: 'Service', description: 'White-glove treatment' },
      ],
      totalProjects: 300,
      totalClients: 165,
      globalPresence: 25,
      employeeCount: 85,
      clientSatisfactionScore: 9.6,
      repeatClientPercentage: 90,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoTitle: 'Elite Service for Elite Yachts',
      videoDescription: 'Experience the Elite difference.',
      promotionPack: {
        homepageBanner: false,
        searchResultsPriority: 88,
        categoryTopPlacement: true,
        sponsoredContent: false,
        monthlyFeaturedArticle: true,
        socialMediaShoutouts: 2,
        emailNewsletterFeature: true,
      },
    },
  ];

  let created = 0;
  let failed = 0;

  for (const vendorData of vendors) {
    try {
      console.log(`Creating ${vendorData.companyName}...`);

      // Create user
      const user = await payload.create({
        collection: 'users',
        data: {
          email: vendorData.email,
          password: vendorData.password,
          role: 'vendor',
          status: 'approved',
        },
      });

      // Extract vendor-specific data
      const { email, password, ...vendorFields } = vendorData;

      // Create vendor
      await payload.create({
        collection: 'vendors',
        data: {
          ...vendorFields,
          user: user.id,
        },
      });

      console.log(`  ✅ Created ${vendorData.companyName} (${vendorData.tier})`);
      created++;
    } catch (error) {
      console.error(`  ❌ Failed to create ${vendorData.companyName}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Failed: ${failed}`);
  console.log(`\n✅ Vendor seeding complete!`);
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Upload vendor logos via /admin/collections/vendors`);
  console.log(`  2. Add certifications, case studies, team members via dashboard`);
  console.log(`  3. Test tier features at /vendors`);

  process.exit(0);
}

seedProductionVendors().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
