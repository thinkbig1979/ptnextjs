import { getPayload } from 'payload';
import config from '@payload-config';

interface VendorInfo {
  id: number;
  companyName: string;
  tier: string;
}

// Rich product templates with all fields populated
const productTemplates = [
  {
    name: 'Advanced Marine Navigation System',
    category: 'navigation',
    shortDescription:
      'State-of-the-art navigation system with integrated chart plotting, radar, and sonar capabilities for superior situational awareness.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our Advanced Marine Navigation System represents the pinnacle of maritime technology, combining cutting-edge hardware with intuitive software to deliver unparalleled navigation capabilities for superyachts of all sizes.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Key Capabilities' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'The system integrates seamlessly with multiple data sources including GPS, GLONASS, Galileo, and BeiDou satellite constellations for centimeter-level accuracy. Advanced sensor fusion algorithms combine radar, AIS, sonar, and visual data to provide comprehensive situational awareness in all conditions.',
              },
            ],
          },
        ],
      },
    },
    price: '€125,000 - €450,000',
    pricingConfig: {
      displayText: 'From €125,000',
      subtitle: 'Installation and training included',
      showContactForm: true,
      currency: 'EUR',
    },
    specifications: [
      { label: 'Display Size', value: '24" to 32" Multi-touch' },
      { label: 'Processor', value: 'Quad-core ARM Cortex-A72' },
      { label: 'Resolution', value: '3840 x 2160 (4K UHD)' },
      { label: 'Operating Temperature', value: '-15°C to +55°C' },
      { label: 'Power Consumption', value: '45W typical, 120W max' },
      { label: 'NMEA Compatibility', value: 'NMEA 0183 & NMEA 2000' },
      { label: 'Chart Formats', value: 'C-MAP, Navionics, NOAA, S-57/S-63' },
      { label: 'Waterproof Rating', value: 'IPX7' },
    ],
    features: [
      {
        title: 'Multi-Source Chart Integration',
        description:
          'Seamlessly overlay and blend multiple chart sources for comprehensive coverage worldwide.',
        icon: 'Map',
        order: 1,
      },
      {
        title: 'Advanced Radar Integration',
        description:
          'Full integration with X-band and S-band radar systems with ARPA target tracking.',
        icon: 'Radio',
        order: 2,
      },
      {
        title: 'AI-Powered Route Optimization',
        description:
          'Machine learning algorithms optimize routes based on weather, fuel efficiency, and sea conditions.',
        icon: 'Cpu',
        order: 3,
      },
      {
        title: 'Real-Time Weather Overlay',
        description:
          'Live weather data integration with storm tracking and forecast visualization.',
        icon: 'CloudRain',
        order: 4,
      },
    ],
    benefits: [
      {
        benefit: 'Reduce fuel consumption by up to 15% with optimized routing',
        icon: 'TrendingDown',
        order: 1,
      },
      {
        benefit: 'Enhanced safety through superior situational awareness',
        icon: 'Shield',
        order: 2,
      },
      {
        benefit: 'Intuitive touchscreen interface reduces crew training time',
        icon: 'Users',
        order: 3,
      },
    ],
    services: [
      {
        title: 'Complete Installation Service',
        description:
          'Our certified technicians handle complete system installation, integration with existing equipment, and thorough testing.',
        icon: 'Wrench',
        order: 1,
      },
      {
        title: 'Comprehensive Crew Training',
        description:
          'On-board training for captain and crew covering all system features and emergency procedures.',
        icon: 'GraduationCap',
        order: 2,
      },
      {
        title: '24/7 Technical Support',
        description:
          'Round-the-clock support from our marine electronics experts via satellite communication.',
        icon: 'Headphones',
        order: 3,
      },
    ],
    comparisonMetrics: [
      {
        metricName: 'Chart Update Frequency',
        value: 'Daily',
        numericValue: 365,
        unit: 'updates/year',
        category: 'performance',
        compareHigherBetter: true,
        industryAverage: 'Quarterly',
      },
      {
        metricName: 'GPS Accuracy',
        value: '< 2.5m CEP',
        numericValue: 2.5,
        unit: 'meters',
        category: 'performance',
        compareHigherBetter: false,
        industryAverage: '5-10m',
      },
      {
        metricName: 'Screen Brightness',
        value: '2000 nits',
        numericValue: 2000,
        unit: 'nits',
        category: 'physical',
        compareHigherBetter: true,
        industryAverage: '1000 nits',
      },
    ],
    integrationCompatibility: {
      supportedProtocols: [
        { protocol: 'NMEA 2000', version: '2.0', notes: 'Full PGN support' },
        { protocol: 'NMEA 0183', version: '4.11', notes: 'Bi-directional' },
        { protocol: 'Ethernet', version: 'TCP/IP', notes: 'Multi-device networking' },
      ],
      integrationPartners: [
        {
          partner: 'Garmin Marine',
          integrationType: 'Native',
          certificationLevel: 'certified',
        },
        {
          partner: 'Furuno Radar',
          integrationType: 'Native',
          certificationLevel: 'certified',
        },
        {
          partner: 'Simrad Autopilot',
          integrationType: 'NMEA 2000',
          certificationLevel: 'compatible',
        },
      ],
      apiAvailable: true,
      apiDocumentationUrl: 'https://docs.example.com/api',
      sdkLanguages: [{ language: 'JavaScript' }, { language: 'Python' }, { language: 'C++' }],
    },
    warrantySupport: {
      warrantyYears: 3,
      warrantyDetails:
        'Comprehensive 3-year warranty covering all hardware components, software updates, and technical support. Extended warranty options available for up to 10 years.',
      extendedWarrantyAvailable: true,
      supportChannels: [
        { channel: 'Email' },
        { channel: 'Phone (24/7)' },
        { channel: 'Live Chat' },
        { channel: 'Satellite Phone' },
      ],
      supportResponseTime: 'Critical: 2 hours, High: 4 hours, Normal: 24 hours',
    },
    badges: [
      { label: 'Best in Class 2025', type: 'success', icon: 'Award', order: 1 },
      { label: 'IMO Certified', type: 'info', icon: 'CheckCircle', order: 2 },
      { label: 'ISO 9001', type: 'secondary', icon: 'Badge', order: 3 },
    ],
  },
  {
    name: 'Premium Audio Entertainment System',
    category: 'audio',
    shortDescription:
      'Audiophile-grade marine entertainment system with multi-zone control, streaming capabilities, and crystal-clear sound reproduction.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Experience concert-hall acoustics on the open water with our Premium Audio Entertainment System. Engineered specifically for the demanding marine environment, this system delivers pristine audio quality throughout your vessel.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Uncompromising Sound Quality' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Each component is meticulously designed to withstand salt spray, humidity, and vibration while maintaining reference-quality audio reproduction. Our proprietary acoustic calibration ensures optimal sound in every listening environment aboard your yacht.',
              },
            ],
          },
        ],
      },
    },
    price: '€85,000 - €350,000',
    pricingConfig: {
      displayText: 'From €85,000',
      subtitle: 'Custom installation per yacht specifications',
      showContactForm: true,
      currency: 'EUR',
    },
    specifications: [
      { label: 'Amplifier Power', value: '8x 500W Class D' },
      { label: 'Frequency Response', value: '20Hz - 40kHz' },
      { label: 'THD+N', value: '< 0.001%' },
      { label: 'Streaming Support', value: 'Spotify, Tidal, Qobuz, AirPlay 2' },
      { label: 'Zones', value: 'Up to 16 independent zones' },
      { label: 'Marine Rating', value: 'IPX6 exterior, IPX4 interior' },
      { label: 'Control Interface', value: 'iOS, Android, Web, Wall panels' },
      { label: 'Network', value: 'Gigabit Ethernet, WiFi 6' },
    ],
    features: [
      {
        title: 'Adaptive Room Correction',
        description:
          'Automatically analyzes and compensates for room acoustics in each zone for optimal sound.',
        icon: 'Waves',
        order: 1,
      },
      {
        title: 'Multi-Room Synchronization',
        description:
          'Perfect audio synchronization across all zones with <1ms latency.',
        icon: 'Radio',
        order: 2,
      },
      {
        title: 'High-Resolution Audio',
        description: 'Supports up to 24-bit/192kHz lossless audio and MQA streaming.',
        icon: 'Music',
        order: 3,
      },
      {
        title: 'Voice Control Integration',
        description: 'Full integration with Alexa, Google Assistant, and Siri.',
        icon: 'Mic',
        order: 4,
      },
    ],
    benefits: [
      {
        benefit: 'Transform any space into a premium listening environment',
        icon: 'Speaker',
        order: 1,
      },
      {
        benefit: 'Intuitive control from any device, anywhere on board',
        icon: 'Smartphone',
        order: 2,
      },
      {
        benefit: 'Weather-resistant design ensures years of reliable operation',
        icon: 'Droplet',
        order: 3,
      },
    ],
    services: [
      {
        title: 'Acoustic Design & Planning',
        description:
          'Our acousticians analyze your yacht layout and design optimal speaker placement and system configuration.',
        icon: 'Ruler',
        order: 1,
      },
      {
        title: 'Professional Installation',
        description:
          'Certified marine audio technicians handle complete installation with hidden wiring and custom integration.',
        icon: 'Wrench',
        order: 2,
      },
      {
        title: 'System Calibration',
        description:
          'Precision calibration using professional measurement equipment to optimize every listening zone.',
        icon: 'Settings',
        order: 3,
      },
      {
        title: 'Annual Maintenance',
        description:
          'Regular system health checks, software updates, and performance optimization.',
        icon: 'Calendar',
        order: 4,
      },
    ],
    comparisonMetrics: [
      {
        metricName: 'Total System Power',
        value: '4000W',
        numericValue: 4000,
        unit: 'watts',
        category: 'power',
        compareHigherBetter: true,
        industryAverage: '2000W',
      },
      {
        metricName: 'Signal-to-Noise Ratio',
        value: '120 dB',
        numericValue: 120,
        unit: 'dB',
        category: 'quality',
        compareHigherBetter: true,
        industryAverage: '100 dB',
      },
      {
        metricName: 'Number of Zones',
        value: '16',
        numericValue: 16,
        unit: 'zones',
        category: 'capacity',
        compareHigherBetter: true,
        industryAverage: '8',
      },
    ],
    integrationCompatibility: {
      supportedProtocols: [
        { protocol: 'AirPlay 2', version: '2.0', notes: 'Multi-room support' },
        { protocol: 'Chromecast', version: 'Audio', notes: 'Google ecosystem' },
        { protocol: 'Roon Ready', version: 'Certified', notes: 'Audiophile streaming' },
      ],
      integrationPartners: [
        {
          partner: 'Crestron',
          integrationType: 'Native Driver',
          certificationLevel: 'certified',
        },
        {
          partner: 'Control4',
          integrationType: 'Certified Driver',
          certificationLevel: 'certified',
        },
        {
          partner: 'Savant',
          integrationType: 'IP Control',
          certificationLevel: 'compatible',
        },
      ],
      apiAvailable: true,
      apiDocumentationUrl: 'https://api-docs.example.com',
      sdkLanguages: [{ language: 'JavaScript' }, { language: 'Swift' }, { language: 'Kotlin' }],
    },
    warrantySupport: {
      warrantyYears: 5,
      warrantyDetails:
        '5-year comprehensive warranty covering all electronics, speakers, and amplifiers. Includes annual preventive maintenance visits.',
      extendedWarrantyAvailable: true,
      supportChannels: [
        { channel: 'Email Support' },
        { channel: 'Phone Support' },
        { channel: 'Remote Diagnostics' },
        { channel: 'On-board Service' },
      ],
      supportResponseTime: 'Emergency: 4 hours, Standard: 48 hours',
    },
    badges: [
      { label: 'THX Certified', type: 'success', icon: 'Award', order: 1 },
      { label: 'Marine Grade', type: 'info', icon: 'Anchor', order: 2 },
      { label: 'Dolby Atmos', type: 'secondary', icon: 'Waves', order: 3 },
    ],
  },
  {
    name: 'Intelligent Lighting Control System',
    category: 'lighting',
    shortDescription:
      'Sophisticated LED lighting system with circadian rhythm support, scene automation, and energy-efficient operation.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Illuminate your yacht with intelligent lighting that adapts to your needs and enhances every moment aboard. Our system combines cutting-edge LED technology with smart controls for unparalleled ambiance and efficiency.',
              },
            ],
          },
        ],
      },
    },
    price: '€45,000 - €200,000',
    pricingConfig: {
      displayText: 'From €45,000',
      subtitle: 'Scalable to vessel size and complexity',
      showContactForm: true,
      currency: 'EUR',
    },
    specifications: [
      { label: 'Color Range', value: 'Full RGB + Tunable White (2700K-6500K)' },
      { label: 'Dimming', value: '0.1% - 100% (0.1% steps)' },
      { label: 'Control Zones', value: 'Up to 256 independent zones' },
      { label: 'Efficacy', value: '170 lumens/watt' },
      { label: 'CRI', value: '>95' },
      { label: 'Lifespan', value: '50,000+ hours' },
      { label: 'Control Methods', value: 'App, Voice, Automation, Wall switches' },
      { label: 'Protocol', value: 'DMX512, DALI, KNX compatible' },
    ],
    features: [
      {
        title: 'Circadian Rhythm Lighting',
        description:
          'Automatically adjusts color temperature throughout the day to support natural sleep cycles.',
        icon: 'Sun',
        order: 1,
      },
      {
        title: 'Scene Automation',
        description: 'Pre-programmed and custom scenes for dining, entertaining, and relaxation.',
        icon: 'Sparkles',
        order: 2,
      },
      {
        title: 'Energy Monitoring',
        description: 'Real-time energy consumption tracking and optimization suggestions.',
        icon: 'Zap',
        order: 3,
      },
    ],
    comparisonMetrics: [
      {
        metricName: 'Energy Efficiency',
        value: '170 lm/W',
        numericValue: 170,
        unit: 'lumens/watt',
        category: 'environmental',
        compareHigherBetter: true,
        industryAverage: '120 lm/W',
      },
    ],
    warrantySupport: {
      warrantyYears: 5,
      warrantyDetails: '5-year warranty on all LED fixtures and control equipment.',
      extendedWarrantyAvailable: true,
      supportChannels: [{ channel: 'Email' }, { channel: 'Phone' }],
      supportResponseTime: '24-48 hours',
    },
    badges: [
      { label: 'Energy Star', type: 'success', icon: 'Leaf', order: 1 },
      { label: 'Marine Rated', type: 'info', icon: 'Ship', order: 2 },
    ],
  },
  {
    name: 'Advanced Climate Control System',
    category: 'hvac',
    shortDescription:
      'Precision HVAC system with multi-zone control, air quality monitoring, and whisper-quiet operation.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Maintain perfect comfort in every cabin with our intelligent climate control system. Advanced sensors and algorithms ensure optimal temperature, humidity, and air quality throughout your vessel.',
              },
            ],
          },
        ],
      },
    },
    price: '€150,000 - €600,000',
    pricingConfig: {
      displayText: 'From €150,000',
      subtitle: 'Complete system with installation',
      showContactForm: true,
      currency: 'EUR',
    },
    specifications: [
      { label: 'Cooling Capacity', value: '50,000 - 200,000 BTU' },
      { label: 'Heating Capacity', value: '40,000 - 150,000 BTU' },
      { label: 'Zones', value: 'Up to 32 independent zones' },
      { label: 'Noise Level', value: '< 38 dBA in cabins' },
      { label: 'Air Changes', value: '6-10 per hour' },
      { label: 'Humidity Control', value: '30-70% RH' },
      { label: 'Filtration', value: 'HEPA + Carbon' },
      { label: 'Energy Rating', value: 'SEER 22+' },
    ],
    features: [
      {
        title: 'Smart Zone Control',
        description: 'Independent temperature and humidity control for each cabin and living space.',
        icon: 'Thermometer',
        order: 1,
      },
      {
        title: 'Air Quality Monitoring',
        description: 'Real-time monitoring of CO2, VOCs, particulates, and humidity.',
        icon: 'Wind',
        order: 2,
      },
      {
        title: 'Predictive Maintenance',
        description: 'AI algorithms predict maintenance needs before issues occur.',
        icon: 'AlertTriangle',
        order: 3,
      },
    ],
    comparisonMetrics: [
      {
        metricName: 'Energy Efficiency Ratio',
        value: '22 SEER',
        numericValue: 22,
        unit: 'SEER',
        category: 'environmental',
        compareHigherBetter: true,
        industryAverage: '16 SEER',
      },
      {
        metricName: 'Noise Level',
        value: '38 dB',
        numericValue: 38,
        unit: 'dB',
        category: 'quality',
        compareHigherBetter: false,
        industryAverage: '48 dB',
      },
    ],
    warrantySupport: {
      warrantyYears: 7,
      warrantyDetails:
        '7-year comprehensive warranty on compressors, 3 years on all other components.',
      extendedWarrantyAvailable: true,
      supportChannels: [
        { channel: 'Email' },
        { channel: 'Phone' },
        { channel: 'Emergency Service' },
      ],
      supportResponseTime: 'Emergency: 4 hours, Standard: 24 hours',
    },
    badges: [
      { label: 'Energy Efficient', type: 'success', icon: 'Zap', order: 1 },
      { label: 'Ultra Quiet', type: 'info', icon: 'Volume2', order: 2 },
    ],
  },
];

// Service templates for vendors
const serviceTemplates = [
  {
    name: 'Complete System Integration',
    type: 'integration',
    shortDescription:
      'End-to-end system integration services ensuring seamless operation of all onboard systems.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our integration specialists bring together disparate systems into a unified, harmonious whole. From navigation to entertainment, security to climate control, we ensure every system communicates flawlessly.',
              },
            ],
          },
        ],
      },
    },
    price: '€25,000 - €150,000',
    pricingConfig: {
      displayText: 'From €25,000',
      subtitle: 'Per vessel, based on complexity',
      showContactForm: true,
      currency: 'EUR',
    },
    features: [
      {
        title: 'System Architecture Design',
        description:
          'Comprehensive planning of system interconnections and data flows for optimal performance.',
        icon: 'Network',
        order: 1,
      },
      {
        title: 'Protocol Translation',
        description:
          'Bridge incompatible systems using industry-standard protocol converters and gateways.',
        icon: 'Repeat',
        order: 2,
      },
      {
        title: 'Unified Control Interface',
        description:
          'Single touchpoint for controlling all integrated systems throughout the vessel.',
        icon: 'Tablet',
        order: 3,
      },
      {
        title: 'Testing & Commissioning',
        description:
          'Rigorous testing procedures ensure reliable operation under all conditions.',
        icon: 'CheckCircle',
        order: 4,
      },
    ],
    services: [
      {
        title: 'Site Survey & Assessment',
        description:
          'Detailed evaluation of existing systems, wiring infrastructure, and integration possibilities.',
        icon: 'ClipboardList',
        order: 1,
      },
      {
        title: 'Custom Software Development',
        description:
          'Bespoke control interfaces and automation logic tailored to your specific requirements.',
        icon: 'Code',
        order: 2,
      },
      {
        title: 'Crew Training',
        description:
          'Comprehensive training for captain and crew on system operation and troubleshooting.',
        icon: 'Users',
        order: 3,
      },
      {
        title: 'Ongoing Support & Updates',
        description:
          'Regular software updates, remote diagnostics, and priority technical support.',
        icon: 'Headphones',
        order: 4,
      },
    ],
  },
  {
    name: 'Annual Maintenance Program',
    type: 'maintenance',
    shortDescription:
      'Comprehensive preventive maintenance ensuring peak performance and longevity of all systems.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Protect your investment with our proactive maintenance program. Regular inspections, cleaning, testing, and updates keep your systems running flawlessly year after year.',
              },
            ],
          },
        ],
      },
    },
    price: '€15,000 - €75,000 per year',
    pricingConfig: {
      displayText: 'From €15,000/year',
      subtitle: 'Scheduled visits and priority support',
      showContactForm: true,
      currency: 'EUR',
    },
    features: [
      {
        title: 'Scheduled Inspections',
        description: 'Quarterly on-board inspections by certified technicians.',
        icon: 'Calendar',
        order: 1,
      },
      {
        title: 'Preventive Replacements',
        description: 'Proactive replacement of components before failure occurs.',
        icon: 'RefreshCw',
        order: 2,
      },
      {
        title: 'Performance Optimization',
        description: 'Regular tuning and calibration to maintain peak performance.',
        icon: 'Sliders',
        order: 3,
      },
      {
        title: 'Priority Emergency Service',
        description: '24/7 emergency support with expedited response times.',
        icon: 'Phone',
        order: 4,
      },
    ],
  },
  {
    name: 'Remote Monitoring & Diagnostics',
    type: 'monitoring',
    shortDescription:
      '24/7 remote monitoring service with predictive diagnostics and proactive issue resolution.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our Operations Center monitors your systems around the clock, detecting anomalies before they become problems. Advanced analytics provide insights into system health and usage patterns.',
              },
            ],
          },
        ],
      },
    },
    price: '€8,000 - €35,000 per year',
    pricingConfig: {
      displayText: 'From €8,000/year',
      subtitle: 'Continuous monitoring and alerts',
      showContactForm: true,
      currency: 'EUR',
    },
    features: [
      {
        title: 'Real-Time System Health',
        description: 'Continuous monitoring of all critical system parameters and performance metrics.',
        icon: 'Activity',
        order: 1,
      },
      {
        title: 'Predictive Analytics',
        description: 'Machine learning identifies potential issues before they cause downtime.',
        icon: 'TrendingUp',
        order: 2,
      },
      {
        title: 'Automated Alerts',
        description: 'Instant notifications to crew and shore support when anomalies are detected.',
        icon: 'Bell',
        order: 3,
      },
      {
        title: 'Performance Reports',
        description: 'Monthly reports on system usage, efficiency, and maintenance recommendations.',
        icon: 'FileText',
        order: 4,
      },
    ],
  },
];

async function seedProductsAndServices() {
  console.log('Starting comprehensive product and service seeding...\n');

  const payload = await getPayload({ config });

  // Get all vendors
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 1000,
  });

  console.log(`Found ${vendors.docs.length} vendors\n`);

  // Get or create categories
  let categories: any[] = [];
  try {
    const existingCategories = await payload.find({
      collection: 'categories',
      limit: 100,
    });
    categories = existingCategories.docs;
  } catch (error) {
    console.log('Categories collection not found or empty');
  }

  const categoryMap: { [key: string]: number } = {};
  for (const cat of categories) {
    categoryMap[cat.slug || cat.name.toLowerCase()] = cat.id;
  }

  console.log(`Found ${categories.length} categories\n`);

  // Delete existing products
  try {
    const existingProducts = await payload.find({
      collection: 'products',
      limit: 10000,
    });

    for (const product of existingProducts.docs) {
      await payload.delete({
        collection: 'products',
        id: product.id,
      });
    }
    console.log(`Deleted ${existingProducts.docs.length} existing products\n`);
  } catch (error) {
    console.log('No existing products to delete');
  }

  let productsCreated = 0;
  let servicesCreated = 0;

  // Seed products and services for each vendor
  for (const vendor of vendors.docs) {
    const vendorName = vendor.companyName || `Vendor ${vendor.id}`;
    const vendorTier = vendor.tier || 'free';

    console.log(`\nProcessing ${vendorName} (${vendorTier})...`);

    // Determine how many products this vendor should have based on tier
    let productCount = 0;
    let serviceCount = 0;

    switch (vendorTier) {
      case 'tier4':
      case 'tier3':
        productCount = 4;
        serviceCount = 3;
        break;
      case 'tier2':
        productCount = 3;
        serviceCount = 2;
        break;
      case 'tier1':
        productCount = 2;
        serviceCount = 1;
        break;
      case 'free':
      default:
        productCount = 1;
        serviceCount = 1;
        break;
    }

    // Create products for this vendor
    for (let i = 0; i < productCount; i++) {
      const template = productTemplates[i % productTemplates.length];
      const productName = `${vendorName} ${template.name}`;
      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      try {
        const newProduct = await payload.create({
          collection: 'products',
          data: {
            vendor: vendor.id,
            name: productName,
            slug: slug,
            description: template.description,
            shortDescription: template.shortDescription,
            published: true,
            price: template.price,
            pricing: template.pricingConfig,
            specifications: template.specifications,
            features: template.features || [],
            benefits: template.benefits || [],
            services: template.services || [],
            comparisonMetrics: template.comparisonMetrics || [],
            integrationCompatibility: template.integrationCompatibility || {},
            warrantySupport: template.warrantySupport || {},
            badges: template.badges || [],
            seo: {
              metaTitle: `${productName} - Premium Marine Technology`,
              metaDescription: template.shortDescription,
              keywords: 'marine, yacht, technology, premium, superyacht',
            },
          },
        });

        productsCreated++;
        console.log(`  ✓ Created product: ${productName}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to create product: ${error.message}`);
      }
    }

    // Create services for this vendor
    for (let i = 0; i < serviceCount; i++) {
      const template = serviceTemplates[i % serviceTemplates.length];
      const serviceName = `${vendorName} ${template.name}`;
      const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      try {
        const newService = await payload.create({
          collection: 'products',
          data: {
            vendor: vendor.id,
            name: serviceName,
            slug: slug,
            description: template.description,
            shortDescription: template.shortDescription,
            published: true,
            price: template.price,
            pricing: template.pricingConfig,
            features: template.features || [],
            services: template.services || [],
            badges: [{ label: 'Service', type: 'info', icon: 'Briefcase', order: 1 }],
            seo: {
              metaTitle: `${serviceName} - Professional Marine Services`,
              metaDescription: template.shortDescription,
              keywords: 'marine, yacht, service, maintenance, integration',
            },
          },
        });

        servicesCreated++;
        console.log(`  ✓ Created service: ${serviceName}`);
      } catch (error: any) {
        console.error(`  ✗ Failed to create service: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Total vendors processed: ${vendors.docs.length}`);
  console.log(`Products created: ${productsCreated}`);
  console.log(`Services created: ${servicesCreated}`);
  console.log(`Total items created: ${productsCreated + servicesCreated}`);
  console.log('='.repeat(60) + '\n');

  process.exit(0);
}

seedProductsAndServices().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
