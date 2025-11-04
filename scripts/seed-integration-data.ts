/**
 * Seed Integration Data Script
 * Adds systemRequirements and compatibilityMatrix data to existing products
 */

import { getPayload } from 'payload';
import config from '../payload.config';

// Sample data templates for different product types
const integrationTemplates = {
  navigation: {
    systemRequirements: {
      powerSupply: '12V/24V DC, 10-30W',
      mounting: 'Flush mount, Panel mount, or Rail mount',
      operatingTemp: '-15°C to +55°C',
      certification: 'CE, FCC, NMEA 2000 Certified, IMO Compliant',
      ipRating: 'IP67 Marine Grade (front panel), IP54 (rear connections)',
    },
    compatibilityMatrix: [
      {
        system: 'Garmin GPSMAP Series',
        compatibility: 'full',
        notes: 'Native NMEA 2000 integration, full data sharing including waypoints, routes, and AIS targets',
        requirements: [
          { requirement: 'NMEA 2000 network backbone' },
          { requirement: 'Garmin firmware v8.0 or higher recommended' },
        ],
        complexity: 'simple',
        estimatedCost: '$150-$200 for NMEA 2000 cables and T-connectors',
      },
      {
        system: 'Raymarine Axiom Series',
        compatibility: 'full',
        notes: 'Full integration via NMEA 2000 and SeaTalkNG protocols',
        requirements: [
          { requirement: 'SeaTalkNG to NMEA 2000 adapter (if needed)' },
          { requirement: 'Raymarine software v3.5 or higher' },
        ],
        complexity: 'simple',
        estimatedCost: '$200-$300 including adapters if needed',
      },
      {
        system: 'Furuno NavNet TZtouch3',
        compatibility: 'partial',
        notes: 'NMEA 2000 data sharing supported, but some proprietary features require Furuno equipment',
        requirements: [
          { requirement: 'NMEA 2000 network' },
          { requirement: 'May need Furuno PGN configuration' },
        ],
        complexity: 'moderate',
        estimatedCost: '$250-$400 including professional configuration',
      },
      {
        system: 'Simrad NSS evo3S',
        compatibility: 'full',
        notes: 'Seamless integration with NMEA 2000 and Ethernet networking',
        requirements: [
          { requirement: 'NMEA 2000 backbone or Ethernet connection' },
          { requirement: 'Simrad software v4.0+' },
        ],
        complexity: 'simple',
        estimatedCost: '$150-$250',
      },
    ],
  },

  propulsion: {
    systemRequirements: {
      powerSupply: '24V DC, 50-150W continuous, 300W peak',
      mounting: 'Bulkhead or DIN rail mounting with vibration isolation',
      operatingTemp: '-20°C to +70°C',
      certification: 'CE, UL Marine, DNV-GL, Lloyd\'s Register Approved',
      ipRating: 'IP65 (controller), IP67 (motor housing)',
    },
    compatibilityMatrix: [
      {
        system: 'ABB Marine Controllers',
        compatibility: 'full',
        notes: 'Direct integration with ABB Azipod and thruster systems',
        requirements: [
          { requirement: 'Modbus RTU or CANopen protocol support' },
          { requirement: 'ABB Marine Control System v2.5+' },
        ],
        complexity: 'moderate',
        estimatedCost: '$1,500-$3,000 including integration kit',
      },
      {
        system: 'Kongsberg K-Chief System',
        compatibility: 'full',
        notes: 'Certified for Kongsberg Dynamic Positioning systems',
        requirements: [
          { requirement: 'Kongsberg K-Chief v6.0 or higher' },
          { requirement: 'DP Class 2/3 certification kit' },
        ],
        complexity: 'complex',
        estimatedCost: '$5,000-$10,000 including certification and commissioning',
      },
      {
        system: 'Standard Marine Control Systems',
        compatibility: 'adapter',
        notes: 'Requires communication adapter for non-native protocols',
        requirements: [
          { requirement: 'Protocol converter (Modbus to NMEA/other)' },
          { requirement: 'Custom configuration may be needed' },
        ],
        complexity: 'moderate',
        estimatedCost: '$800-$1,500 for adapter and setup',
      },
    ],
  },

  communications: {
    systemRequirements: {
      powerSupply: '12V/24V DC, 20-50W transmit, 5W standby',
      mounting: 'Bulkhead mount with RF shielding, antenna mast mount',
      operatingTemp: '-25°C to +60°C',
      certification: 'FCC Type Accepted, CE, GMDSS Compliant, SOLAS Approved',
      ipRating: 'IP66 (transceiver), IP68 (antenna)',
    },
    compatibilityMatrix: [
      {
        system: 'Icom Marine VHF Systems',
        compatibility: 'full',
        notes: 'Full DSC integration and cross-vendor interoperability',
        requirements: [
          { requirement: 'NMEA 0183 or NMEA 2000 connection' },
          { requirement: 'GPS position input for DSC' },
        ],
        complexity: 'simple',
        estimatedCost: '$200-$400',
      },
      {
        system: 'Standard Horizon VHF',
        compatibility: 'full',
        notes: 'Standard maritime protocols ensure compatibility',
        requirements: [
          { requirement: 'NMEA 0183 interface' },
        ],
        complexity: 'simple',
        estimatedCost: '$150-$300',
      },
      {
        system: 'Furuno GMDSS System',
        compatibility: 'full',
        notes: 'GMDSS and SOLAS compliant for commercial vessels',
        requirements: [
          { requirement: 'GMDSS certification for installation' },
          { requirement: 'Professional commissioning required' },
        ],
        complexity: 'complex',
        estimatedCost: '$2,000-$5,000 including certification',
      },
    ],
  },

  entertainment: {
    systemRequirements: {
      powerSupply: '12V/24V DC or 110V/220V AC, 100-500W depending on configuration',
      mounting: 'In-wall, in-ceiling, or surface mount with marine-grade fixtures',
      operatingTemp: '0°C to +45°C (climate controlled spaces)',
      certification: 'CE, FCC, UL Marine, ABYC Compliant',
      ipRating: 'IP54 (indoor), IP65 (outdoor spaces)',
    },
    compatibilityMatrix: [
      {
        system: 'Sonos Multi-Room Audio',
        compatibility: 'full',
        notes: 'Native integration with Sonos ecosystem via WiFi or Ethernet',
        requirements: [
          { requirement: 'Stable WiFi network (marine-grade router recommended)' },
          { requirement: 'Sonos app v14.0 or higher' },
        ],
        complexity: 'simple',
        estimatedCost: '$500-$1,000 for network infrastructure',
      },
      {
        system: 'Crestron Home Automation',
        compatibility: 'full',
        notes: 'Professional-grade integration with full automation control',
        requirements: [
          { requirement: 'Crestron processor' },
          { requirement: 'Professional programming and commissioning' },
        ],
        complexity: 'complex',
        estimatedCost: '$5,000-$15,000 including integration and programming',
      },
      {
        system: 'Fusion Marine Entertainment',
        compatibility: 'full',
        notes: 'Purpose-built marine entertainment integration',
        requirements: [
          { requirement: 'NMEA 2000 or Fusion MS-RA770 head unit' },
          { requirement: 'Zone configuration setup' },
        ],
        complexity: 'moderate',
        estimatedCost: '$1,000-$2,500',
      },
      {
        system: 'Standard Bluetooth Audio',
        compatibility: 'partial',
        notes: 'Basic Bluetooth connectivity available, but advanced features may be limited',
        requirements: [
          { requirement: 'Bluetooth 5.0+ for best range and quality' },
        ],
        complexity: 'simple',
        estimatedCost: '$50-$200',
      },
    ],
  },

  monitoring: {
    systemRequirements: {
      powerSupply: '12V/24V DC, 5-15W per sensor, 20-50W for central hub',
      mounting: 'DIN rail or bulkhead mount (hub), various sensor-specific mounts',
      operatingTemp: '-30°C to +80°C (sensor dependent)',
      certification: 'CE, UL Marine, NMEA 2000 Certified, Classification Society Approved',
      ipRating: 'IP67-IP68 (sensors), IP54 (display units)',
    },
    compatibilityMatrix: [
      {
        system: 'Maretron N2KView Monitoring',
        compatibility: 'full',
        notes: 'Industry-standard NMEA 2000 monitoring with extensive sensor support',
        requirements: [
          { requirement: 'NMEA 2000 backbone' },
          { requirement: 'Maretron N2KView software license' },
        ],
        complexity: 'moderate',
        estimatedCost: '$1,000-$3,000 depending on sensor count',
      },
      {
        system: 'Victron VRM Monitoring',
        compatibility: 'full',
        notes: 'Complete power and energy monitoring integration',
        requirements: [
          { requirement: 'Victron GX device (Cerbo GX, etc.)' },
          { requirement: 'VRM cloud account' },
        ],
        complexity: 'moderate',
        estimatedCost: '$500-$1,500',
      },
      {
        system: 'Yacht Controller Systems',
        compatibility: 'adapter',
        notes: 'Integration possible with protocol converters',
        requirements: [
          { requirement: 'Modbus or CANbus adapter' },
          { requirement: 'Custom configuration' },
        ],
        complexity: 'complex',
        estimatedCost: '$2,000-$4,000 including adapter and programming',
      },
    ],
  },
};

async function seedIntegrationData() {
  console.log('🌱 Starting integration data seeding...\n');

  const payload = await getPayload({ config });

  // Get all products
  const products = await payload.find({
    collection: 'products',
    limit: 100,
  });

  console.log(`📦 Found ${products.totalDocs} products to update\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products.docs) {
    try {
      // Skip if already has integration data
      if (product.integrationCompatibility?.systemRequirements?.powerSupply) {
        console.log(`⏭️  Skipping "${product.name}" - already has system requirements`);
        skippedCount++;
        continue;
      }

      // Determine product type based on name/category and select appropriate template
      let template = integrationTemplates.monitoring; // Default
      const productName = product.name.toLowerCase();
      const category = product.categories?.[0]?.name?.toLowerCase() || '';

      if (productName.includes('navigation') || productName.includes('gps') ||
          productName.includes('radar') || productName.includes('chart') ||
          category.includes('navigation')) {
        template = integrationTemplates.navigation;
      } else if (productName.includes('propulsion') || productName.includes('engine') ||
                 productName.includes('thruster') || productName.includes('motor') ||
                 category.includes('propulsion')) {
        template = integrationTemplates.propulsion;
      } else if (productName.includes('radio') || productName.includes('vhf') ||
                 productName.includes('communication') || productName.includes('satellite') ||
                 category.includes('communication')) {
        template = integrationTemplates.communications;
      } else if (productName.includes('entertainment') || productName.includes('audio') ||
                 productName.includes('video') || productName.includes('media') ||
                 category.includes('entertainment')) {
        template = integrationTemplates.entertainment;
      } else if (productName.includes('monitor') || productName.includes('sensor') ||
                 productName.includes('alarm') || productName.includes('control') ||
                 category.includes('monitoring') || category.includes('safety')) {
        template = integrationTemplates.monitoring;
      }

      // Get existing integrationCompatibility data or create new
      const existingIntegration = product.integrationCompatibility || {};

      // Update product with integration data (merge carefully to avoid conflicts)
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          integrationCompatibility: {
            // Preserve existing fields
            supportedProtocols: existingIntegration.supportedProtocols || [],
            integrationPartners: existingIntegration.integrationPartners || [],
            apiAvailable: existingIntegration.apiAvailable || false,
            apiDocumentationUrl: existingIntegration.apiDocumentationUrl || undefined,
            sdkLanguages: existingIntegration.sdkLanguages || [],
            // Add new fields
            systemRequirements: template.systemRequirements,
            compatibilityMatrix: template.compatibilityMatrix,
          },
        },
      });

      console.log(`✅ Updated "${product.name}" with integration data (${template === integrationTemplates.navigation ? 'Navigation' : template === integrationTemplates.propulsion ? 'Propulsion' : template === integrationTemplates.communications ? 'Communications' : template === integrationTemplates.entertainment ? 'Entertainment' : 'Monitoring'} template)`);
      updatedCount++;

    } catch (error) {
      console.error(`❌ Error updating product "${product.name}":`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Integration data seeding complete!`);
  console.log(`   📊 Updated: ${updatedCount} products`);
  console.log(`   ⏭️  Skipped: ${skippedCount} products (already had data)`);
  console.log(`   📦 Total: ${products.totalDocs} products\n`);

  process.exit(0);
}

// Run the seeding
seedIntegrationData().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
