#!/bin/bash
# Script to update ExcelImportCard with file-upload integration

# Backup the original file
cp components/dashboard/ExcelImportCard.tsx components/dashboard/ExcelImportCard.tsx.backup

# Update the imports to include uploadFile
sed -i "s/import { UpgradePromptCard } from '.\/UpgradePromptCard';/import { UpgradePromptCard } from '.\/UpgradePromptCard';\nimport { uploadFile } from '@\/lib\/utils\/file-upload';/" components/dashboard/ExcelImportCard.tsx

echo "ExcelImportCard.tsx updated successfully!"
echo "Backup saved to ExcelImportCard.tsx.backup"
