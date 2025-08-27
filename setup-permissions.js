#!/usr/bin/env node

const STRAPI_URL = 'http://localhost:1337';

async function setupPermissions() {
  try {
    // First, we need to get the public role ID
    console.log('Getting public role...');
    const rolesResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles`);
    
    if (!rolesResponse.ok) {
      console.error('Failed to get roles:', rolesResponse.status, rolesResponse.statusText);
      return;
    }
    
    const rolesData = await rolesResponse.json();
    const publicRole = rolesData.roles?.find(role => role.type === 'public');
    
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
      'api::blog-post.blog-post': ['find', 'findOne'],
      'api::blog-category.blog-category': ['find', 'findOne'],
      'api::team-member.team-member': ['find', 'findOne'],
      'api::company-info.company-info': ['find', 'findOne'],
      'api::tag.tag': ['find', 'findOne'],
      'api::blog.blog': ['find', 'findOne']
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

    console.log('Updating permissions...');
    const updateResponse = await fetch(
      `${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update permissions:', updateResponse.status, updateResponse.statusText);
      const error = await updateResponse.text();
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Permissions updated successfully');
    console.log('📋 Available endpoints:');
    console.log('- GET /api/partners');
    console.log('- GET /api/categories');
    console.log('- GET /api/products');
    console.log('- GET /api/blog-posts');
    console.log('- GET /api/blog-categories');
    console.log('- GET /api/team-members');
    console.log('- GET /api/company-infos');
    console.log('- GET /api/tags');

  } catch (error) {
    console.error('Error setting up permissions:', error.message);
  }
}

setupPermissions();