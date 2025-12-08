/**
 * Jest Polyfills
 *
 * Provides necessary polyfills for the Jest test environment.
 * This file runs BEFORE the test framework is installed.
 *
 * @see https://jestjs.io/docs/configuration#setupfiles-array
 */

// Set test environment variables before any imports
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'test-secret-for-jest-tests-only';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-for-jest-tests';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-jest-tests';

const { TextEncoder, TextDecoder } = require('util');

// TextEncoder/TextDecoder polyfill for Node.js test environment
// Required for APIs that use these (e.g., fetch, streams)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// structuredClone polyfill for older Node.js versions
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// BroadcastChannel polyfill (used by some React features)
if (typeof BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor() {
      this.onmessage = null;
    }
    postMessage() {}
    close() {}
  };
}

// Request/Response/Headers polyfills for Next.js server components
// These are needed when tests import files that use Next.js server features
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new (global.Headers || Map)(init.headers);
      this.body = init.body;
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new (global.Headers || Map)(init.headers);
    }
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
    text() {
      return Promise.resolve(String(this.body));
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super();
      if (init) {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  };
}

// ResizeObserver polyfill for components that use it (e.g., Leaflet maps)
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// URL.createObjectURL and URL.revokeObjectURL polyfills
// Required for file download functionality (CSV export, PDF generation)
if (typeof URL.createObjectURL === 'undefined') {
  let objectUrlCounter = 0;
  URL.createObjectURL = () => `blob:mock-url-${++objectUrlCounter}`;
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = () => {};
}
