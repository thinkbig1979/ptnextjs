#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = '301a4aaacc4b88f7d3584cec4ed6015bb5c2d51afbbd4d1f5264aedcced2b9fd4362a9b3ec48728cdb317ea58df9697813cccf1680616e597f55dd0a9dcdc0965fb9396d159c6979746030ee68014a739bced05fef714544253dcf2ab1ddbbb16db2107039ff0a06f948f385217361d7f86f305bb920dd495b67b8a00250fccc';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function configurePermissions() {
  try {
    console.log('🔧 Configuring Strapi API permissions...\n');

    // Step 1: Get the public role
    console.log('1. Fetching public role...');
    const rolesResponse = await makeRequest(`${STRAPI_URL}/api/users-permissions/roles`);
    
    if (rolesResponse.status !== 200) {
      throw new Error(`Failed to fetch roles: ${rolesResponse.status}`);
    }

    const publicRole = rolesResponse.data.roles?.find(role => role.type === 'public');
    if (!publicRole) {
      throw new Error('Public role not found');
    }
    
    console.log(`✅ Found public role: ${publicRole.id}`);

    // Step 2: Configure permissions for each content type
    console.log('\n2. Configuring permissions...');
    
    const contentTypes = ['partner', 'category', 'product', 'blog-post'];
    const permissions = {};
    
    for (const contentType of contentTypes) {
      permissions[`api::${contentType}.${contentType}`] = {
        find: { enabled: true },
        findOne: { enabled: true }
      };
      console.log(`✅ Configured permissions for ${contentType}`);
    }

    // Step 3: Update the public role
    console.log('\n3. Updating public role permissions...');
    
    const updateData = {
      name: publicRole.name,
      description: publicRole.description,
      type: publicRole.type,
      permissions: permissions
    };

    const updateResponse = await makeRequest(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
      method: 'PUT',
      body: updateData
    });

    if (updateResponse.status !== 200) {
      throw new Error(`Failed to update permissions: ${updateResponse.status}`);
    }

    console.log('✅ Permissions updated successfully!');

    // Step 4: Test the API endpoints
    console.log('\n4. Testing API endpoints...');
    
    for (const contentType of contentTypes) {
      const pluralType = contentType === 'category' ? 'categories' : `${contentType}s`;
      try {
        const testResponse = await makeRequest(`${STRAPI_URL}/api/${pluralType}`);
        if (testResponse.status === 200) {
          console.log(`✅ /api/${pluralType} - Working`);
        } else {
          console.log(`❌ /api/${pluralType} - Status: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ /api/${pluralType} - Error: ${error.message}`);
      }
    }

    console.log('\n🎉 Strapi API permissions configured successfully!');
    console.log('\n📋 Available endpoints:');
    console.log('- GET /api/partners');
    console.log('- GET /api/partners/:id');
    console.log('- GET /api/categories');
    console.log('- GET /api/categories/:id');
    console.log('- GET /api/products');
    console.log('- GET /api/products/:id');
    console.log('- GET /api/blog-posts');
    console.log('- GET /api/blog-posts/:id');

  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

configurePermissions();