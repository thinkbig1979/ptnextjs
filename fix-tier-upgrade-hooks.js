#!/usr/bin/env node

/**
 * Script to add afterCreate and afterChange hooks to TierUpgradeRequests collection
 * This adds email notification functionality when:
 * 1. A vendor submits a tier upgrade request (afterCreate)
 * 2. An admin approves/rejects the request (afterChange)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'payload/collections/TierUpgradeRequests.ts');

// Read the current file
const currentContent = fs.readFileSync(filePath, 'utf8');

// Check if hooks are already updated
if (currentContent.includes('afterCreate')) {
  console.log('Hooks already exist. Skipping update.');
  process.exit(0);
}

// New imports to add
const importsToAdd = `import {
  sendTierUpgradeRequestedEmail,
  sendTierUpgradeApprovedEmail,
  sendTierUpgradeRejectedEmail,
} from '@/lib/services/EmailService';`;

// The afterCreate hook function
const afterCreateHook = `
    afterCreate: [
      async ({ doc, req }) => {
        // Send admin notification when vendor submits tier upgrade request
        try {
          console.log('[EmailService] Sending tier upgrade request notification email...');

          // Get vendor ID (handle both object and string reference)
          const vendorId = typeof doc.vendor === 'object' ? doc.vendor.id : doc.vendor;

          // Fetch vendor data to get companyName and contactEmail
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: vendorId,
          });

          // Prepare request data for email service
          const requestData = {
            companyName: vendor.companyName,
            contactEmail: vendor.contactEmail,
            currentTier: doc.currentTier,
            requestedTier: doc.requestedTier,
            vendorNotes: doc.vendorNotes,
            requestId: doc.id,
            vendorId: vendorId,
          };

          // Send email notification
          await sendTierUpgradeRequestedEmail(requestData);
          console.log('[EmailService] Tier upgrade request notification sent successfully');
        } catch (error) {
          console.error('[EmailService] Failed to send tier upgrade request notification:', error);
          // Don't block the operation if email fails
        }

        return doc;
      },
    ],`;

// The afterChange hook function
const afterChangeHook = `
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Send vendor approval/rejection emails when status changes
        try {
          // Check if status field changed
          if (!previousDoc || previousDoc.status === doc.status) {
            return doc;
          }

          // Get vendor ID (handle both object and string reference)
          const vendorId = typeof doc.vendor === 'object' ? doc.vendor.id : doc.vendor;

          // Fetch vendor data to get companyName and contactEmail
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: vendorId,
          });

          // Prepare request data for email service
          const requestData = {
            companyName: vendor.companyName,
            contactEmail: vendor.contactEmail,
            currentTier: doc.currentTier,
            requestedTier: doc.requestedTier,
            vendorNotes: doc.vendorNotes,
            rejectionReason: doc.rejectionReason,
            requestId: doc.id,
            vendorId: vendorId,
          };

          // Handle approval status change
          if (previousDoc.status === 'pending' && doc.status === 'approved') {
            console.log('[EmailService] Sending tier upgrade approval email...');
            await sendTierUpgradeApprovedEmail(requestData);
            console.log('[EmailService] Tier upgrade approval email sent successfully');
          }
          // Handle rejection status change
          else if (previousDoc.status === 'pending' && doc.status === 'rejected') {
            console.log('[EmailService] Sending tier upgrade rejection email...');
            await sendTierUpgradeRejectedEmail(requestData, doc.rejectionReason || '');
            console.log('[EmailService] Tier upgrade rejection email sent successfully');
          }
        } catch (error) {
          console.error('[EmailService] Failed to send tier upgrade status change email:', error);
          // Don't block the operation if email fails
        }

        return doc;
      },
    ],`;

// Step 1: Add imports after the first import line
let updatedContent = currentContent.replace(
  `import type { CollectionConfig } from 'payload';`,
  `import type { CollectionConfig } from 'payload';\n${importsToAdd}`
);

// Step 2: Find the hooks object closing and add afterCreate and afterChange
// The pattern is: closing of beforeChange array, then closing of hooks object, then closing of config
updatedContent = updatedContent.replace(
  `    ],\n  },\n};`,
  `    ],\n${afterCreateHook}\n${afterChangeHook}\n  },\n};`
);

// Write the updated content back
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully updated TierUpgradeRequests.ts with email notification hooks!');
