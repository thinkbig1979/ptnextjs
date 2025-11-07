import type { CollectionConfig } from 'payload';

const ImportHistory: CollectionConfig = {
  slug: 'import_history',

  admin: {
    useAsTitle: 'importDate',
    group: 'Vendor Management',
    defaultColumns: ['importDate', 'vendor', 'status', 'rowsProcessed', 'successfulRows', 'failedRows'],
  },

  access: {
    // Admins can read all import history
    // Vendors can only read their own import history
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'vendor') {
        // Vendors can only see their own import history
        return {
          vendor: { equals: user.vendorId },
        };
      }
      return false;
    },

    // Only vendors can create import history (via API)
    create: ({ req: { user } }) => user?.role === 'vendor' || user?.role === 'admin',

    // Only admins can update import history
    update: ({ req: { user } }) => user?.role === 'admin',

    // Only admins can delete import history
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
        description: 'Vendor who performed the import',
      },
    },

    // User Relationship (importing user, required)
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'User who performed the import',
      },
    },

    // Import Date (timestamp of import)
    {
      name: 'importDate',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Timestamp of import execution',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'MMM dd, yyyy h:mm a',
        },
      },
    },

    // Status (success, partial, failed)
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Partial Success', value: 'partial' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      index: true,
      admin: {
        description: 'Overall status of the import operation',
      },
    },

    // Rows Processed (total number of rows in the file)
    {
      name: 'rowsProcessed',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Total number of rows processed from the Excel file',
      },
    },

    // Successful Rows (rows imported without errors)
    {
      name: 'successfulRows',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Number of rows successfully imported',
      },
    },

    // Failed Rows (rows with errors)
    {
      name: 'failedRows',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Number of rows that failed to import',
      },
    },

    // Changes (JSON field for field-by-field changes)
    {
      name: 'changes',
      type: 'json',
      required: false,
      admin: {
        description: 'Detailed field-by-field changes made during import (JSON)',
      },
    },

    // Errors (JSON field for import errors)
    {
      name: 'errors',
      type: 'json',
      required: false,
      admin: {
        description: 'Errors encountered during import with row numbers and details (JSON)',
      },
    },

    // Filename (original uploaded file name)
    {
      name: 'filename',
      type: 'text',
      required: false,
      admin: {
        description: 'Original filename of the imported Excel file',
      },
    },
  ],

  timestamps: true, // Auto createdAt/updatedAt

  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-set importDate if not provided (on create)
        if (operation === 'create' && !data.importDate) {
          data.importDate = new Date().toISOString();
        }

        // Validate row counts consistency
        if (data.rowsProcessed !== undefined && data.successfulRows !== undefined && data.failedRows !== undefined) {
          if (data.rowsProcessed !== data.successfulRows + data.failedRows) {
            throw new Error('Row counts inconsistent: rowsProcessed must equal successfulRows + failedRows');
          }
        }

        // Auto-determine status based on row counts if not set
        if (operation === 'create' && !data.status && data.successfulRows !== undefined && data.failedRows !== undefined) {
          if (data.failedRows === 0) {
            data.status = 'success';
          } else if (data.successfulRows > 0) {
            data.status = 'partial';
          } else {
            data.status = 'failed';
          }
        }

        return data;
      },
    ],
  },
};

export default ImportHistory;
