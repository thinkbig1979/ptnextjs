import { getPayload } from 'payload';
import config from '../payload.config';

const categories = [
  'Navigation & Communication',
  'Audio Visual Systems',
  'Propulsion & Engineering',
  'Interior Design',
  'Safety & Security',
  'Lighting & Electrical',
  'Deck Equipment',
  'Galley Equipment',
];

const tagSets = [
  ['Navigation', 'GPS', 'ECDIS'],
  ['Audio', 'Video', 'Entertainment'],
  ['Propulsion', 'Thrusters', 'Engineering'],
  ['Design', 'Interior', 'Luxury'],
  ['Security', 'Surveillance', 'Safety'],
  ['Lighting', 'LED', 'Electrical'],
  ['Deck', 'Hardware', 'Rigging'],
  ['Galley', 'Appliances', 'Catering'],
];

async function addCategoriesAndTags() {
  const payload = await getPayload({ config });
  const vendors = await payload.find({ collection: 'vendors', limit: 1000 });

  let i = 0;
  for (const vendor of vendors.docs) {
    await payload.update({
      collection: 'vendors',
      id: vendor.id,
      data: {
        category: categories[i % categories.length],
        tags: tagSets[i % tagSets.length],
      },
    });
    console.log(`✅ ${vendor.companyName}: ${categories[i % categories.length]}`);
    i++;
  }
  console.log(`\n✅ Updated ${i} vendors`);
}

addCategoriesAndTags().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
