import type { CollectionConfig } from 'payload';
import {
  sendTierUpgradeRequestedEmail,
  sendTierUpgradeApprovedEmail,
  sendTierUpgradeRejectedEmail,
} from '../../lib/services/EmailService';

const TierUpgradeRequests: CollectionConfig = {
  slug: 'tier_upgrade_requests',

  admin: {
    useAsTitle: 'id',
    group: 'Administration',
    defaultColumns: ['vendor', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
  },

  access: {
    // Admins can read all requests
    // Vendors can only read their own requests
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'vendor') {
        // Vendors can only see their own requests
        return {
          vendor: { equals: user.vendorId },
        };
      }
      return false;
    },

    // Only vendors can create tier upgrade requests
    create: ({ req: { user } }) => user?.role === 'vendor',

    // Only admins can update requests (for approval/rejection)
    update: ({ req: { user } }) => user?.role === 'admin',

    // Only admins can delete requests
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    // Vendor Relationship (required)
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description: 'Vendor submitting the tier upgrade request',
      },
    },

    // User Relationship (submitting user, required)
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'User who submitted the request',
      },
    },

    // Current Tier (snapshot at request time, auto-populated)
    {
      name: 'currentTier',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Tier 1', value: 'tier1' },
        { label: 'Tier 2', value: 'tier2' },
        { label: 'Tier 3', value: 'tier3' },
      ],
      required: true,
      admin: {
        description: 'Vendor tier at time of request (auto-populated)',
      },
    },

    // Requested Tier (cannot request 'free' - downgrades not supported)
    {
      name: 'requestedTier',
      type: 'select',
      options: [
        { label: 'Tier 1 - Enhanced Profile', value: 'tier1' },
        { label: 'Tier 2 - Full Product Management', value: 'tier2' },
        { label: 'Tier 3 - Premium Promoted Profile', value: 'tier3' },
      ],
      required: true,
      admin: {
        description: 'Requested tier (must be higher than current tier)',
      },
    },

    // Status (pending, approved, rejected, cancelled)
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
      admin: {
        description: 'Request status',
      },
    },

    // Vendor Notes (optional business justification)
    {
      name: 'vendorNotes',
      type: 'textarea',
      maxLength: 500,
      required: false,
      admin: {
        description: 'Business justification from vendor (optional, max 500 characters)',
      },
    },

    // Rejection Reason (optional, set by admin)
    {
      name: 'rejectionReason',
      type: 'textarea',
      maxLength: 1000,
      required: false,
      admin: {
        description: 'Reason for rejection (admin only, max 1000 characters)',
      },
    },

    // Reviewed By (admin who reviewed the request)
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      hasMany: false,
      admin: {
        description: 'Admin who reviewed the request',
      },
    },

    // Requested At (timestamp of submission)
    {
      name: 'requestedAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Timestamp of request submission',
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
    },

    // Reviewed At (timestamp of admin review)
    {
      name: 'reviewedAt',
      type: 'date',
      required: false,
      admin: {
        description: 'Timestamp of admin review',
        date: {
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
    },
  ],

  timestamps: true, // Auto createdAt/updatedAt

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // 1. Auto-populate currentTier from vendor on create
        if (operation === 'create' && data.vendor) {
          const vendorId = typeof data.vendor === 'object' ? data.vendor.id : data.vendor;
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: vendorId,
          });

          // Only auto-populate if currentTier not explicitly set
          if (!data.currentTier) {
            data.currentTier = vendor.tier;
          }
        }

        // 2. Validate requested tier > current tier
        if (data.requestedTier && data.currentTier) {
          const tierOrder: Record<string, number> = {
            free: 0,
            tier1: 1,
            tier2: 2,
            tier3: 3,
          };

          if (tierOrder[data.requestedTier] <= tierOrder[data.currentTier]) {
            throw new Error('Requested tier must be higher than current tier');
          }
        }

        // 3. Auto-set requestedAt if not provided (on create)
        if (operation === 'create' && !data.requestedAt) {
          data.requestedAt = new Date().toISOString();
        }

        // 4. Validate unique pending request per vendor
        if (operation === 'create' && data.status === 'pending') {
          const vendorId = typeof data.vendor === 'object' ? data.vendor.id : data.vendor;
          const existingPending = await req.payload.find({
            collection: 'tier_upgrade_requests',
            where: {
              and: [
                { vendor: { equals: vendorId } },
                { status: { equals: 'pending' } },
              ],
            },
            limit: 1,
          });

          if (existingPending.docs.length > 0) {
            throw new Error('Vendor already has a pending tier upgrade request');
          }
        }

        return data;
      },
    ],
    afterChange: [
      // Send email notifications on tier upgrade request create and status changes
      async ({ doc, previousDoc, req, operation }) => {
        try {
          // Fetch vendor data (needed for all email types)
          const vendorId = typeof doc.vendor === 'object' ? doc.vendor.id : doc.vendor;
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: vendorId,
          });

          // Handle new tier upgrade request (admin notification)
          if (operation === 'create') {
            console.log('[EmailService] Sending tier upgrade request email...');
            await sendTierUpgradeRequestedEmail({
              companyName: vendor.companyName,
              contactEmail: vendor.contactEmail,
              currentTier: doc.currentTier,
              requestedTier: doc.requestedTier,
              vendorNotes: doc.vendorNotes,
              requestId: doc.id,
              vendorId: vendorId,
            });
            return doc;
          }

          // Handle status changes (update operations only)
          if (operation === 'update' && previousDoc) {
            const previousStatus = previousDoc.status;
            const currentStatus = doc.status;

            // Only send emails when status changes from pending
            if (previousStatus !== 'pending') {
              return doc;
            }

            const emailData = {
              companyName: vendor.companyName,
              contactEmail: vendor.contactEmail,
              currentTier: doc.currentTier,
              requestedTier: doc.requestedTier,
              vendorNotes: doc.vendorNotes,
              rejectionReason: doc.rejectionReason,
              requestId: doc.id,
              vendorId: vendorId,
            };

            // Tier upgrade approved - status changed from pending to approved
            if (currentStatus === 'approved') {
              console.log('[EmailService] Sending tier upgrade approved email...');
              await sendTierUpgradeApprovedEmail(emailData);
            }

            // Tier upgrade rejected - status changed from pending to rejected
            if (currentStatus === 'rejected') {
              console.log('[EmailService] Sending tier upgrade rejected email...');
              await sendTierUpgradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[EmailService] Failed to send tier upgrade email:', errorMessage);
          // Don't block document operations on email failure
        }
        return doc;
      },
    ],
  },
};

export default TierUpgradeRequests;
