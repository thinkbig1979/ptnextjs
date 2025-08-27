const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function setupPermissions() {
  try {
    // First, we need to get the public role ID
    const rolesResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
    const publicRole = rolesResponse.data.roles.find(role => role.type === 'public');
    
    if (!publicRole) {
      console.error('Public role not found');
      return;
    }

    console.log('Found public role:', publicRole.id);

    // Define the permissions we want to enable for public access
    const permissions = {
      'api::partner.partner': ['find', 'findOne'],
      'api::category.category': ['find', 'findOne'],
      'api::product.product': ['find', 'findOne'],
      'api::blog-post.blog-post': ['find', 'findOne']
    };

    // Update the public role permissions
    const updateData = {
      permissions: {}
    };

    // Build permissions object
    for (const [contentType, actions] of Object.entries(permissions)) {
      updateData.permissions[contentType] = {};
      actions.forEach(action => {
        updateData.permissions[contentType][action] = {
          enabled: true
        };
      });
    }

    const updateResponse = await axios.put(
      `${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`,
      updateData
    );

    console.log('Permissions updated successfully');
    console.log('Available endpoints:');
    console.log('- GET /api/partners');
    console.log('- GET /api/partners/:id');
    console.log('- GET /api/categories');
    console.log('- GET /api/categories/:id');
    console.log('- GET /api/products');
    console.log('- GET /api/products/:id');
    console.log('- GET /api/blog-posts');
    console.log('- GET /api/blog-posts/:id');

  } catch (error) {
    console.error('Error setting up permissions:', error.response?.data || error.message);
  }
}

setupPermissions();