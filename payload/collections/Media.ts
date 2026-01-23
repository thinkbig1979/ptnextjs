import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/rbac';

const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Media',
    description: 'Upload files or reference external URLs',
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 576,
        position: 'centre',
      },
      {
        name: 'full',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  access: {
    // Public read access for all media (images need to be publicly viewable)
    read: () => true,
    // Only admins can create media via Payload admin (vendors use /api/media/upload)
    create: isAdmin,
    // Admins can update all media, vendors can only update media associated with their vendor
    update: async ({ req: { user, payload } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role !== 'vendor') return false;

      // Find the vendor associated with this user
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          user: { equals: user.id },
        },
        limit: 1,
      });

      if (!vendors.docs[0]) return false;

      // Return a where query that restricts to media owned by this vendor
      return {
        vendor: {
          equals: vendors.docs[0].id,
        },
      };
    },
    // Admins can delete all media, vendors can only delete media associated with their vendor
    delete: async ({ req: { user, payload } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role !== 'vendor') return false;

      // Find the vendor associated with this user
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          user: { equals: user.id },
        },
        limit: 1,
      });

      if (!vendors.docs[0]) return false;

      // Return a where query that restricts to media owned by this vendor
      return {
        vendor: {
          equals: vendors.docs[0].id,
        },
      };
    },
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // If externalUrl is provided, clear the filename to indicate no upload
        // This allows the collection to work with external URLs without requiring file upload
        if (data?.externalUrl && !data?.filename) {
          // Use external URL as the title if no filename exists
          data.filename = data.externalUrl.split('/').pop() || 'external-media';
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      label: 'Vendor',
      admin: {
        position: 'sidebar',
        description: 'The vendor that owns this media file',
      },
      // Allow null for admin uploads or system media
      required: false,
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: 'External URL',
      admin: {
        position: 'sidebar',
        description: 'Use an external image/video URL instead of uploading. Must start with http:// or https://',
        placeholder: 'https://example.com/image.jpg',
        condition: (data) => !data?.filename || data?.externalUrl,
      },
      validate: (val: string | null | undefined) => {
        if (val && !val.match(/^https?:\/\/.+/)) {
          return 'Must be a valid HTTP or HTTPS URL';
        }
        return true;
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility (recommended for all images)',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Image caption or description',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Source/Credit URL',
      admin: {
        description: 'Original source URL if using an external image (for attribution)',
        condition: (data) => !!data?.externalUrl,
      },
    },
  ],
};

export default Media;
