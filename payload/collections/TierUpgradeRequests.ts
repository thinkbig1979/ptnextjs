import type { CollectionConfig } from 'payload';
import {
  sendTierUpgradeRequestedEmail,
  sendTierUpgradeApprovedEmail,
  sendTierUpgradeRejectedEmail,
  sendTierDowngradeRequestedEmail,
  sendTierDowngradeApprovedEmail,
  sendTierDowngradeRejectedEmail,
} from '../../lib/services/EmailService';

const TierUpgradeRequests: CollectionConfig = {
  slug: 'tier_upgrade_requests',

  admin: {
    useAsTitle: 'id',
    group: 'Administration',
    defaultColumns: ['vendor', 'requestType', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
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
        description: 'Vendor submitting the tier change request',
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

    // Request Type (upgrade or downgrade)
    {
      name: 'requestType',
      type: 'select',
      options: [
        { label: 'Upgrade', value: 'upgrade' },
        { label: 'Downgrade', value: 'downgrade' },
      ],
      defaultValue: 'upgrade',
      required: true,
      index: true,
      admin: {
        description: 'Type of tier change request (upgrade or downgrade)',
      },
    },

    // Requested Tier (supports both upgrades and downgrades)
    {
      name: 'requestedTier',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Tier 1 - Enhanced Profile', value: 'tier1' },
        { label: 'Tier 2 - Full Product Management', value: 'tier2' },
        { label: 'Tier 3 - Premium Promoted Profile', value: 'tier3' },
      ],
      required: true,
      admin: {
        description: 'Requested tier (must be different from current tier based on request type)',
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

        // 2. Auto-detect requestType and validate tier comparison
        if (data.requestedTier && data.currentTier) {
          const tierOrder: Record<string, number> = {
            free: 0,
            tier1: 1,
            tier2: 2,
            tier3: 3,
          };

          const requestedTierValue = tierOrder[data.requestedTier];
          const currentTierValue = tierOrder[data.currentTier];

          // Auto-detect requestType if not explicitly set
          if (!data.requestType) {
            if (requestedTierValue > currentTierValue) {
              data.requestType = 'upgrade';
            } else if (requestedTierValue < currentTierValue) {
              data.requestType = 'downgrade';
            } else {
              throw new Error('Requested tier must be different from current tier');
            }
          }

          // Validate based on requestType
          if (data.requestType === 'upgrade') {
            if (requestedTierValue <= currentTierValue) {
              throw new Error('Requested tier must be higher than current tier for upgrades');
            }
          } else if (data.requestType === 'downgrade') {
            if (requestedTierValue >= currentTierValue) {
              throw new Error('Requested tier must be lower than current tier for downgrades');
            }
          }
        }

        // 3. Auto-set requestedAt if not provided (on create)
        if (operation === 'create' && !data.requestedAt) {
          data.requestedAt = new Date().toISOString();
        }

        // 4. Validate unique pending request per vendor per request type
        // A vendor can have ONE pending upgrade AND ONE pending downgrade at the same time
        // But NOT two pending upgrades or two pending downgrades
        if (operation === 'create' && data.status === 'pending') {
          const vendorId = typeof data.vendor === 'object' ? data.vendor.id : data.vendor;
          const requestType = data.requestType || 'upgrade';

          const existingPending = await req.payload.find({
            collection: 'tier_upgrade_requests',
            where: {
              and: [
                { vendor: { equals: vendorId } },
                { status: { equals: 'pending' } },
                { requestType: { equals: requestType } },
              ],
            },
            limit: 1,
          });

          if (existingPending.docs.length > 0) {
            const requestTypeName = requestType === 'upgrade' ? 'upgrade' : 'downgrade';
            throw new Error(`Vendor already has a pending tier ${requestTypeName} request`);
          }
        }

        return data;
      },
    ],
    afterChange: [
      // Send email notifications on tier request create and status changes
      async ({ doc, previousDoc, req, operation }) => {
        try {
          // Fetch vendor data (needed for all email types)
          const vendorId = typeof doc.vendor === 'object' ? doc.vendor.id : doc.vendor;
          const vendor = await req.payload.findByID({
            collection: 'vendors',
            id: vendorId,
          });

          // Determine if this is an upgrade or downgrade
          const requestType = doc.requestType || 'upgrade';
          const isUpgrade = requestType === 'upgrade';

          // Handle new tier request (admin notification)
          if (operation === 'create') {
            const emailData = {
              companyName: vendor.companyName,
              contactEmail: vendor.contactEmail,
              currentTier: doc.currentTier,
              requestedTier: doc.requestedTier,
              vendorNotes: doc.vendorNotes,
              requestId: doc.id,
              vendorId: vendorId,
            };

            if (isUpgrade) {
              console.log('[EmailService] Sending tier upgrade request email...');
              await sendTierUpgradeRequestedEmail(emailData);
            } else {
              console.log('[EmailService] Sending tier downgrade request email...');
              await sendTierDowngradeRequestedEmail(emailData);
            }
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

            // Tier request approved - status changed from pending to approved
            if (currentStatus === 'approved') {
              if (isUpgrade) {
                console.log('[EmailService] Sending tier upgrade approved email...');
                await sendTierUpgradeApprovedEmail(emailData);
              } else {
                console.log('[EmailService] Sending tier downgrade approved email...');
                await sendTierDowngradeApprovedEmail(emailData);
              }
            }

            // Tier request rejected - status changed from pending to rejected
            if (currentStatus === 'rejected') {
              if (isUpgrade) {
                console.log('[EmailService] Sending tier upgrade rejected email...');
                await sendTierUpgradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');
              } else {
                console.log('[EmailService] Sending tier downgrade rejected email...');
                await sendTierDowngradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[EmailService] Failed to send tier request email:', errorMessage);
          // Don't block document operations on email failure
        }
        return doc;
      },
    ],
  },
};

export default TierUpgradeRequests;
