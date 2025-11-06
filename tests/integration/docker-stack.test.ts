/**
 * Docker Stack Integration Tests (TDD RED Phase)
 *
 * These tests validate Docker infrastructure BEFORE implementation.
 * Expected result: ALL TESTS SHOULD FAIL (files don't exist yet)
 *
 * Test coverage:
 * - Container startup and health
 * - Service connectivity
 * - Data persistence across restarts
 * - Environment configuration
 */

import Docker from 'dockerode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);
const docker = new Docker();

// Test configuration
const TEST_CONFIG = {
  projectName: 'ptnextjs-test',
  dockerComposeFile: path.join(__dirname, '../../docker/docker-compose.yml'),
  dockerFile: path.join(__dirname, '../../docker/Dockerfile'),
  appPort: 3000,
  appUrl: 'http://localhost:3000',
  healthCheckUrl: 'http://localhost:3000/api/health',
  healthCheckReadyUrl: 'http://localhost:3000/api/health/ready',
  containerStartTimeout: 120000, // 2 minutes
  healthCheckInterval: 5000, // 5 seconds
  maxHealthCheckRetries: 24, // 2 minutes total
};

// Cleanup helper
async function cleanupDockerResources() {
  try {
    // Stop and remove containers
    await execAsync(`docker-compose -f ${TEST_CONFIG.dockerComposeFile} -p ${TEST_CONFIG.projectName} down -v`);

    // Remove dangling images
    const containers = await docker.listContainers({ all: true, filters: { name: [TEST_CONFIG.projectName] } });
    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      await container.remove({ force: true });
    }
  } catch (error) {
    // Ignore cleanup errors (resources may not exist)
    console.log('Cleanup note:', error.message);
  }
}

// Health check helper
async function waitForHealthyContainer(containerName: string): Promise<boolean> {
  let retries = 0;

  while (retries < TEST_CONFIG.maxHealthCheckRetries) {
    try {
      const containers = await docker.listContainers({
        all: true,
        filters: { name: [containerName] }
      });

      if (containers.length === 0) {
        throw new Error(`Container ${containerName} not found`);
      }

      const containerInfo = containers[0];
      const state = containerInfo.State;
      const health = containerInfo.Status;

      if (state === 'running' && health.includes('healthy')) {
        return true;
      }

      // Container running but not healthy yet
      if (state === 'running') {
        console.log(`Waiting for ${containerName} to be healthy... (attempt ${retries + 1}/${TEST_CONFIG.maxHealthCheckRetries})`);
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.healthCheckInterval));
        retries++;
        continue;
      }

      // Container not running
      throw new Error(`Container ${containerName} is in state: ${state}`);
    } catch (error) {
      if (retries >= TEST_CONFIG.maxHealthCheckRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.healthCheckInterval));
      retries++;
    }
  }

  return false;
}

// HTTP request helper
async function httpGet(url: string, expectedStatus: number = 200): Promise<any> {
  const response = await fetch(url);
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
  }
  return response.json().catch(() => response.text());
}

describe('Docker Stack Integration', () => {
  // Setup: Clean environment before tests
  beforeAll(async () => {
    console.log('Setting up Docker test environment...');
    await cleanupDockerResources();
  }, 30000);

  // Teardown: Clean up after all tests
  afterAll(async () => {
    console.log('Cleaning up Docker test environment...');
    await cleanupDockerResources();
  }, 30000);

  describe('Container Startup', () => {
    it('should have Dockerfile at correct location', () => {
      expect(fs.existsSync(TEST_CONFIG.dockerFile)).toBe(true);
    });

    it('should have docker-compose.yml at correct location', () => {
      expect(fs.existsSync(TEST_CONFIG.dockerComposeFile)).toBe(true);
    });

    it('should start application container successfully', async () => {
      // Start Docker Compose stack
      await execAsync(`docker-compose -f ${TEST_CONFIG.dockerComposeFile} -p ${TEST_CONFIG.projectName} up -d`);

      // Wait for container to be running
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      expect(containers.length).toBeGreaterThan(0);
      expect(containers[0].State).toBe('running');
    }, TEST_CONFIG.containerStartTimeout);

    it('should create named volumes', async () => {
      const volumes = await docker.listVolumes({
        filters: { name: [`${TEST_CONFIG.projectName}`] }
      });

      expect(volumes.Volumes.length).toBeGreaterThan(0);

      // Expect at least payload-db and media volumes
      const volumeNames = volumes.Volumes.map(v => v.Name);
      expect(volumeNames.some(name => name.includes('payload-db'))).toBe(true);
      expect(volumeNames.some(name => name.includes('media'))).toBe(true);
    }, 30000);

    it('should join external proxy network', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      expect(containers.length).toBeGreaterThan(0);

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      expect(containerInfo.NetworkSettings.Networks).toHaveProperty('proxy');
    }, 30000);

    it('should report healthy status within timeout', async () => {
      const isHealthy = await waitForHealthyContainer(`${TEST_CONFIG.projectName}-app`);
      expect(isHealthy).toBe(true);
    }, TEST_CONFIG.containerStartTimeout);
  });

  describe('Service Connectivity', () => {
    it('should respond to HTTP requests on port 3000', async () => {
      const response = await fetch(TEST_CONFIG.appUrl);
      expect(response.status).toBeLessThan(500); // Should not be server error
    }, 30000);

    it('should have health check endpoint accessible', async () => {
      const health = await httpGet(TEST_CONFIG.healthCheckUrl, 200);
      expect(health).toHaveProperty('status');
      expect(health.status).toBe('healthy');
    }, 30000);

    it('should have database ready check functional', async () => {
      const readyCheck = await httpGet(TEST_CONFIG.healthCheckReadyUrl, 200);
      expect(readyCheck).toHaveProperty('status');
      expect(readyCheck).toHaveProperty('database');
      expect(readyCheck.database).toBe('connected');
    }, 30000);

    it('should serve static assets', async () => {
      const response = await fetch(`${TEST_CONFIG.appUrl}/_next/static`);
      expect(response.status).toBeLessThan(500);
    }, 30000);

    it('should have correct Content-Security-Policy headers', async () => {
      const response = await fetch(TEST_CONFIG.appUrl);
      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toBeDefined();
    }, 30000);
  });

  describe('Data Persistence', () => {
    const testDataKey = `test-${Date.now()}`;

    it('should persist database data across container restarts', async () => {
      // Create test data
      // Note: This assumes admin API endpoint exists
      const createResponse = await fetch(`${TEST_CONFIG.appUrl}/api/test-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: testDataKey, value: 'test-value' }),
      });

      expect(createResponse.status).toBeLessThan(500);

      // Restart container
      await execAsync(`docker-compose -f ${TEST_CONFIG.dockerComposeFile} -p ${TEST_CONFIG.projectName} restart app`);

      // Wait for container to be healthy again
      await waitForHealthyContainer(`${TEST_CONFIG.projectName}-app`);

      // Verify data still exists
      const readResponse = await fetch(`${TEST_CONFIG.appUrl}/api/test-data?key=${testDataKey}`);
      expect(readResponse.status).toBe(200);

      const data = await readResponse.json();
      expect(data.value).toBe('test-value');
    }, TEST_CONFIG.containerStartTimeout * 2);

    it('should mount volumes at correct paths', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      const mounts = containerInfo.Mounts;
      expect(mounts.length).toBeGreaterThan(0);

      // Check for database volume mount
      const dbMount = mounts.find(m => m.Destination === '/data');
      expect(dbMount).toBeDefined();
      expect(dbMount?.Type).toBe('volume');

      // Check for media volume mount
      const mediaMount = mounts.find(m => m.Destination === '/app/media');
      expect(mediaMount).toBeDefined();
      expect(mediaMount?.Type).toBe('volume');
    }, 30000);

    it('should preserve media uploads across restarts', async () => {
      // Upload test file
      const formData = new FormData();
      const testFile = new Blob(['test content'], { type: 'text/plain' });
      formData.append('file', testFile, 'test.txt');

      const uploadResponse = await fetch(`${TEST_CONFIG.appUrl}/api/media`, {
        method: 'POST',
        body: formData,
      });

      expect(uploadResponse.status).toBeLessThan(500);
      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.url;

      // Restart container
      await execAsync(`docker-compose -f ${TEST_CONFIG.dockerComposeFile} -p ${TEST_CONFIG.projectName} restart app`);
      await waitForHealthyContainer(`${TEST_CONFIG.projectName}-app`);

      // Verify file still accessible
      const fileResponse = await fetch(`${TEST_CONFIG.appUrl}${fileUrl}`);
      expect(fileResponse.status).toBe(200);
    }, TEST_CONFIG.containerStartTimeout * 2);
  });

  describe('Environment Configuration', () => {
    it('should load DATABASE_URL from environment', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      const env = containerInfo.Config.Env;
      const databaseUrl = env.find(e => e.startsWith('DATABASE_URL='));

      expect(databaseUrl).toBeDefined();
      expect(databaseUrl).toContain('file:///data/payload.db');
    }, 30000);

    it('should have PAYLOAD_SECRET configured', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      const env = containerInfo.Config.Env;
      const payloadSecret = env.find(e => e.startsWith('PAYLOAD_SECRET='));

      expect(payloadSecret).toBeDefined();
      expect(payloadSecret?.split('=')[1].length).toBeGreaterThanOrEqual(32);
    }, 30000);

    it('should have NODE_ENV set to production', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      const env = containerInfo.Config.Env;
      const nodeEnv = env.find(e => e.startsWith('NODE_ENV='));

      expect(nodeEnv).toBeDefined();
      expect(nodeEnv).toContain('production');
    }, 30000);

    it('should have NEXT_PUBLIC_SERVER_URL configured', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      const env = containerInfo.Config.Env;
      const serverUrl = env.find(e => e.startsWith('NEXT_PUBLIC_SERVER_URL='));

      expect(serverUrl).toBeDefined();
    }, 30000);

    it('should enforce required environment variables', async () => {
      // Try to start container without required env vars
      const result = await execAsync(
        `docker run --rm -e NODE_ENV=production ${TEST_CONFIG.projectName}-app:latest echo "started"`
      ).catch(error => error);

      // Should fail due to missing required environment variables
      expect(result.code).not.toBe(0);
    }, 30000);
  });

  describe('Container Resource Limits', () => {
    it('should have memory limit configured', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      expect(containerInfo.HostConfig.Memory).toBeGreaterThan(0);
      expect(containerInfo.HostConfig.Memory).toBeLessThanOrEqual(1024 * 1024 * 1024); // 1GB max
    }, 30000);

    it('should have CPU limit configured', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      expect(containerInfo.HostConfig.CpuQuota).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Health Check Configuration', () => {
    it('should have HEALTHCHECK instruction in Dockerfile', () => {
      const dockerfile = fs.readFileSync(TEST_CONFIG.dockerFile, 'utf-8');
      expect(dockerfile).toContain('HEALTHCHECK');
    });

    it('should run health checks at configured interval', async () => {
      const containers = await docker.listContainers({
        filters: { name: [`${TEST_CONFIG.projectName}-app`] }
      });

      const container = docker.getContainer(containers[0].Id);
      const containerInfo = await container.inspect();

      expect(containerInfo.Config.Healthcheck).toBeDefined();
      expect(containerInfo.Config.Healthcheck?.Interval).toBe(30000000000); // 30s in nanoseconds
      expect(containerInfo.Config.Healthcheck?.Retries).toBe(3);
      expect(containerInfo.Config.Healthcheck?.Timeout).toBe(10000000000); // 10s in nanoseconds
    }, 30000);
  });
});
