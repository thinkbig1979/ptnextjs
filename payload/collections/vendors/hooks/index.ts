/**
 * Vendor collection hooks
 */

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import {
  sendProfilePublishedEmail,
  sendVendorRejectedEmail,
  sendVendorRegisteredEmail,
} from '../../../../lib/services/EmailService';

/**
 * After create hook - send registration email to admin
 */
export const afterCreateHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation === 'create') {
    // Send registration email to admin
    await sendVendorRegisteredEmail({
      companyName: doc.companyName,
      contactEmail: doc.contactEmail,
      tier: doc.tier || 'free',
      vendorId: String(doc.id),
    });
  }
};

/**
 * After change hook - handle registration status changes
 */
export const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  // Only handle updates
  if (operation !== 'update') return;

  const prevStatus = previousDoc?.registrationStatus;
  const newStatus = doc.registrationStatus;

  // Registration approved
  if (prevStatus === 'pending' && newStatus === 'approved') {
    await sendProfilePublishedEmail({
      companyName: doc.companyName,
      contactEmail: doc.contactEmail,
      tier: doc.tier || 'free',
      vendorId: String(doc.id),
    });
  }

  // Registration rejected
  if (prevStatus === 'pending' && newStatus === 'rejected') {
    await sendVendorRejectedEmail(
      {
        companyName: doc.companyName,
        contactEmail: doc.contactEmail,
        tier: doc.tier || 'free',
        vendorId: String(doc.id),
      },
      doc.rejectionReason || 'No reason provided'
    );
  }

  // Published status changed
  const prevPublished = previousDoc?.published;
  const newPublished = doc.published;
  if (!prevPublished && newPublished && doc.registrationStatus === 'approved') {
    await sendProfilePublishedEmail({
      companyName: doc.companyName,
      contactEmail: doc.contactEmail,
      tier: doc.tier || 'free',
      vendorId: String(doc.id),
    });
  }
};

/**
 * After delete hook - cleanup related data
 */
export const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
  // Future: Cleanup related products, locations, etc.
  console.log(`Vendor ${doc.companyName} (${doc.id}) deleted`);
};
