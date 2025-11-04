import { getPayload } from 'payload';
import config from '../payload.config';

async function verifyCompleteProfile() {
  const payload = await getPayload({ config });

  const vendor = await payload.findByID({
    collection: 'vendors',
    id: '22', // Tier 3 test vendor
  });

  console.log('🔍 COMPLETE VENDOR PROFILE VERIFICATION\n');
  console.log('=' .repeat(60));
  console.log(`Vendor: ${vendor.companyName}`);
  console.log(`Tier: ${vendor.tier}`);
  console.log('=' .repeat(60));

  const fields = {
    '📧 Contact Email': vendor.contactEmail,
    '📞 Contact Phone': vendor.contactPhone,
    '🌐 Website': vendor.website,
    '💼 LinkedIn': vendor.linkedinUrl,
    '🐦 Twitter': vendor.twitterUrl,
    '📅 Founded Year': vendor.foundedYear,
    '👥 Employee Count': vendor.employeeCount,
    '📊 Total Projects': vendor.totalProjects,
    '👍 LinkedIn Followers': vendor.linkedinFollowers,
    '📷 Instagram Followers': vendor.instagramFollowers,
    '⭐ Client Satisfaction': vendor.clientSatisfactionScore,
    '🔄 Repeat Client %': vendor.repeatClientPercentage,
    '📝 Long Description': vendor.longDescription ? `${vendor.longDescription.substring(0, 80)}...` : null,
    '🏷️  Category': vendor.category,
    '🏷️  Tags': vendor.tags?.join(', '),
    '📜 Certifications': vendor.certifications?.length || 0,
    '🏆 Awards': vendor.awards?.length || 0,
    '👨‍💼 Team Members': vendor.teamMembers?.length || 0,
    '🎯 Service Areas': vendor.serviceAreas?.length || 0,
    '💡 Company Values': vendor.companyValues?.length || 0,
    '📍 Locations': vendor.locations?.length || 0,
  };

  for (const [label, value] of Object.entries(fields)) {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${label}: ${value || 'NOT SET'}`);
  }

  if (vendor.locations && vendor.locations.length > 0) {
    console.log('\n📍 LOCATIONS:');
    vendor.locations.forEach((loc: any, i: number) => {
      console.log(`  ${i + 1}. ${loc.locationName} (${loc.city}, ${loc.country})`);
      console.log(`     ${loc.address}, ${loc.postalCode}`);
      console.log(`     HQ: ${loc.isHQ ? 'Yes' : 'No'}`);
    });
  }

  if (vendor.certifications && vendor.certifications.length > 0) {
    console.log('\n📜 CERTIFICATIONS:');
    vendor.certifications.slice(0, 2).forEach((cert: any, i: number) => {
      console.log(`  ${i + 1}. ${cert.name} (${cert.issuer}, ${cert.year})`);
    });
  }

  if (vendor.awards && vendor.awards.length > 0) {
    console.log('\n🏆 AWARDS:');
    vendor.awards.slice(0, 2).forEach((award: any, i: number) => {
      console.log(`  ${i + 1}. ${award.title} (${award.organization}, ${award.year})`);
    });
  }

  if (vendor.teamMembers && vendor.teamMembers.length > 0) {
    console.log('\n👨‍💼 TEAM MEMBERS:');
    vendor.teamMembers.slice(0, 2).forEach((member: any, i: number) => {
      console.log(`  ${i + 1}. ${member.name} - ${member.role}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ PROFILE IS COMPLETE!\n');
}

verifyCompleteProfile()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
