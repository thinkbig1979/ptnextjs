const fs = require('fs');
const path = require('path');

const collectionsDir = path.join(__dirname, '../payload/collections');
const files = [
  'BlogPosts.ts',
  'Products.ts',
  'CompanyInfo.ts'
];

files.forEach(file => {
  const filePath = path.join(collectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add lexicalEditor import if not present
  if (!content.includes('lexicalEditor')) {
    content = content.replace(
      /import type { CollectionConfig } from 'payload';/,
      `import type { CollectionConfig } from 'payload';\nimport { lexicalEditor } from '@payloadcms/richtext-lexical';`
    );
  }

  // Fix all richText fields by adding editor prop
  // Match richText fields and add editor if missing
  content = content.replace(
    /({\s*name:\s*['"][\w]+['"],\s*type:\s*['"]richText['"],)/g,
    (match) => {
      // Check if this field already has editor prop
      const fieldStart = content.indexOf(match);
      const fieldEnd = content.indexOf('},', fieldStart);
      const fieldContent = content.substring(fieldStart, fieldEnd);

      if (!fieldContent.includes('editor:')) {
        // Add editor prop after type
        return match.replace(
          /type:\s*['"]richText['"],/,
          `type: 'richText',\n      editor: lexicalEditor({}),`
        );
      }
      return match;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

console.log('All RichText fields fixed!');
