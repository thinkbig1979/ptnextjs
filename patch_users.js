const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'payload', 'collections', 'Users.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add tokenVersion field after rejectedAt
const tokenVersionField = `    {
      name: 'tokenVersion',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Incremented to invalidate all existing tokens',
        readOnly: true,
      },
      access: {
        update: () => false, // Only updated via hooks
      },
    },`;

// Find the rejectedAt field closing brace and add tokenVersion after it
content = content.replace(
  /(name: 'rejectedAt',[\s\S]*?    },)\n(  \],)/,
  `$1\n${tokenVersionField}\n$2`
);

// 2. Add tokenVersion increment hook to beforeChange array
const tokenVersionHook = `      // Increment tokenVersion on password change or security status change
      async ({ data, originalDoc, operation }) => {
        if (operation !== 'update' || !originalDoc) {
          return data;
        }

        let shouldIncrement = false;

        // Increment on password change
        if (data.password) {
          shouldIncrement = true;
        }

        // Increment on status change to suspended or rejected
        const statusChanged = data.status && data.status !== originalDoc.status;
        const newStatusRevokes = ['suspended', 'rejected'].includes(data.status);
        if (statusChanged && newStatusRevokes) {
          shouldIncrement = true;
        }

        if (shouldIncrement) {
          data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
        }

        return data;
      },`;

// Find the end of the first beforeChange hook and add the new hook
content = content.replace(
  /(beforeChange: \[[\s\S]*?return data;\n      },)\n(    \],)/,
  `$1\n${tokenVersionHook}\n$2`
);

// Write the modified content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Successfully patched Users.ts');
console.log('Added:');
console.log('1. tokenVersion field to fields array');
console.log('2. tokenVersion increment hook to beforeChange hooks');
