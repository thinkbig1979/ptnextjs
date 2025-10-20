/**
 * Script to add real location data to vendors in Payload CMS database directly
 * Bypasses tier restrictions by using direct database access
 */

import { getPayload } from "payload";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Real, working locations with accurate coordinates
const vendorLocations = [
  {
    address: "1 Bahia Mar Blvd, Fort Lauderdale, FL 33316, USA",
    latitude: 26.1224,
    longitude: -80.1373,
    city: "Fort Lauderdale",
    country: "United States",
  },
  {
    address: "1 Herald Plaza, Miami, FL 33132, USA",
    latitude: 25.7617,
    longitude: -80.1918,
    city: "Miami",
    country: "United States",
  },
  {
    address: "Port de Monaco, 98000 Monaco",
    latitude: 43.7384,
    longitude: 7.4246,
    city: "Monaco",
    country: "Monaco",
  },
  {
    address: "Port Vell, 08039 Barcelona, Spain",
    latitude: 41.3784,
    longitude: 2.1863,
    city: "Barcelona",
    country: "Spain",
  },
  {
    address: "Ocean Village, Southampton SO14 3TL, UK",
    latitude: 50.8998,
    longitude: -1.3926,
    city: "Southampton",
    country: "United Kingdom",
  },
  {
    address: "1 Washington St, Newport, RI 02840, USA",
    latitude: 41.4901,
    longitude: -71.3128,
    city: "Newport",
    country: "United States",
  },
  {
    address: "Port Vauban, 06600 Antibes, France",
    latitude: 43.5845,
    longitude: 7.125,
    city: "Antibes",
    country: "France",
  },
  {
    address: "1483 Alaskan Way, Seattle, WA 98101, USA",
    latitude: 47.6062,
    longitude: -122.3321,
    city: "Seattle",
    country: "United States",
  },
];

async function addVendorLocations() {
  try {
    // Import Payload config
    const configPromise = import("../payload.config");
    const config = (await configPromise).default;

    // Get Payload instance
    const payload = await getPayload({ config });

    console.log("🔍 Fetching all vendors...");

    // Get all vendors
    const vendors = await payload.find({
      collection: "vendors",
      limit: 100,
      overrideAccess: true, // Bypass access control
    });

    console.log(`📊 Found ${vendors.docs.length} vendors`);

    if (vendors.docs.length === 0) {
      console.log("⚠️  No vendors found in database");
      return;
    }

    // Add locations to vendors (cycling through our location list)
    let updatedCount = 0;

    for (let i = 0; i < vendors.docs.length; i++) {
      const vendor = vendors.docs[i];
      const location = vendorLocations[i % vendorLocations.length];

      console.log(`\n📍 Updating vendor: ${vendor.name}`);
      console.log(`   Location: ${location.city}, ${location.country}`);
      console.log(
        `   Coordinates: ${location.latitude}, ${location.longitude}`
      );

      try {
        await payload.update({
          collection: "vendors",
          id: vendor.id,
          data: {
            location: {
              address: location.address,
              latitude: location.latitude,
              longitude: location.longitude,
              city: location.city,
              country: location.country,
            },
          },
          overrideAccess: true, // Bypass access control and tier restrictions
        });

        updatedCount++;
        console.log(`   ✅ Updated successfully`);
      } catch (error) {
        console.error(`   ❌ Failed to update vendor ${vendor.name}:`, error);
      }
    }

    console.log(
      `\n🎉 Successfully updated ${updatedCount} out of ${vendors.docs.length} vendors`
    );
    console.log("\n📍 Locations assigned:");
    vendorLocations.forEach((loc, idx) => {
      console.log(
        `   ${idx + 1}. ${loc.city}, ${loc.country} (${loc.latitude}, ${
          loc.longitude
        })`
      );
    });
  } catch (error) {
    console.error("❌ Error adding vendor locations:", error);
    throw error;
  }
}

// Run the script
addVendorLocations()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
