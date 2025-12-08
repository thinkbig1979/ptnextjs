#!/bin/bash

# Script to add tokenVersion field and hook to Users.ts

FILE="/home/edwin/development/ptnextjs/payload/collections/Users.ts"

# Create backup
cp "$FILE" "${FILE}.backup"

# Add tokenVersion field after rejectedAt field
sed -i '/name: .rejectedAt.,$/,/},$/{
  /^    },$/a\
    {\
      name: '\''tokenVersion'\'',\
      type: '\''number'\'',\
      defaultValue: 0,\
      admin: {\
        position: '\''sidebar'\'',\
        description: '\''Incremented to invalidate all existing tokens'\'',\
        readOnly: true,\
      },\
      access: {\
        update: () => false, // Only updated via hooks\
      },\
    },
}' "$FILE"

# Add tokenVersion increment hook after the existing beforeChange hook
sed -i '/return data;$/,/},$/{
  /^      },$/{
    N
    /^      },\n    \],$/{
      s/},\n    \],/},\
      \/\/ Increment tokenVersion on password change or security status change\
      async ({ data, originalDoc, operation }) => {\
        if (operation !== '\''update'\'' || !originalDoc) {\
          return data;\
        }\
\
        let shouldIncrement = false;\
\
        \/\/ Increment on password change\
        if (data.password) {\
          shouldIncrement = true;\
        }\
\
        \/\/ Increment on status change to suspended or rejected\
        const statusChanged = data.status \&\& data.status !== originalDoc.status;\
        const newStatusRevokes = ['\''suspended'\'', '\''rejected'\''].includes(data.status);\
        if (statusChanged \&\& newStatusRevokes) {\
          shouldIncrement = true;\
        }\
\
        if (shouldIncrement) {\
          data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;\
        }\
\
        return data;\
      },\
    ],/
    }
  }
}' "$FILE"

echo "Patch applied. Backup saved to ${FILE}.backup"
