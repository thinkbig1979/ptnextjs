/**
 * Test Documentation Fetching Utility
 *
 * Fetches documentation for testing libraries using a priority-based
 * fallback system: DocFork MCP → Context7 MCP → WebSearch → WebFetch
 *
 * @version 1.0.0
 * @module fetch-test-documentation
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation source configurations
 */
const DOCUMENTATION_SOURCES = {
  dockfork: {
    priority: 1,
    type: 'mcp',
    tool_prefix: 'mcp__dockfork__',
    check_tools: ['mcp__dockfork__get_documentation', 'mcp__dockfork__search_docs'],
    description: 'DocFork MCP - Pre-indexed documentation'
  },
  context7: {
    priority: 2,
    type: 'mcp',
    tool_prefix: 'mcp__context7__',
    check_tools: ['mcp__context7__get_library_docs', 'mcp__context7__resolve_library_id'],
    description: 'Context7 MCP - AI-optimized documentation'
  },
  websearch: {
    priority: 3,
    type: 'builtin',
    tool_name: 'WebSearch',
    description: 'Web search for official documentation'
  },
  webfetch: {
    priority: 4,
    type: 'builtin',
    tool_name: 'WebFetch',
    description: 'Direct fetch of known documentation URLs'
  }
};

/**
 * Library-specific documentation URLs for direct fetching
 */
const DIRECT_DOC_URLS = {
  // Test Runners
  vitest: {
    main: 'https://vitest.dev/api/',
    mocking: 'https://vitest.dev/api/vi.html',
    expect: 'https://vitest.dev/api/expect.html',
    config: 'https://vitest.dev/config/'
  },
  jest: {
    main: 'https://jestjs.io/docs/api',
    mocking: 'https://jestjs.io/docs/mock-functions',
    expect: 'https://jestjs.io/docs/expect',
    config: 'https://jestjs.io/docs/configuration'
  },
  mocha: {
    main: 'https://mochajs.org/#getting-started',
    hooks: 'https://mochajs.org/#hooks',
    async: 'https://mochajs.org/#asynchronous-code'
  },
  pytest: {
    main: 'https://docs.pytest.org/en/stable/',
    fixtures: 'https://docs.pytest.org/en/stable/how-to/fixtures.html',
    markers: 'https://docs.pytest.org/en/stable/how-to/mark.html'
  },

  // E2E Frameworks
  playwright: {
    main: 'https://playwright.dev/docs/api/class-test',
    assertions: 'https://playwright.dev/docs/test-assertions',
    locators: 'https://playwright.dev/docs/locators',
    config: 'https://playwright.dev/docs/test-configuration'
  },
  '@playwright/test': {
    main: 'https://playwright.dev/docs/api/class-test',
    assertions: 'https://playwright.dev/docs/test-assertions'
  },
  cypress: {
    main: 'https://docs.cypress.io/api/table-of-contents',
    commands: 'https://docs.cypress.io/api/commands/and',
    assertions: 'https://docs.cypress.io/guides/references/assertions'
  },

  // Mocking
  msw: {
    main: 'https://mswjs.io/docs/',
    handlers: 'https://mswjs.io/docs/basics/mocking-responses',
    setup: 'https://mswjs.io/docs/integrations'
  },
  sinon: {
    main: 'https://sinonjs.org/releases/latest/',
    stubs: 'https://sinonjs.org/releases/latest/stubs/',
    mocks: 'https://sinonjs.org/releases/latest/mocks/'
  },

  // Component Testing
  '@testing-library/react': {
    main: 'https://testing-library.com/docs/react-testing-library/intro',
    queries: 'https://testing-library.com/docs/queries/about',
    events: 'https://testing-library.com/docs/dom-testing-library/api-events'
  },
  '@vue/test-utils': {
    main: 'https://test-utils.vuejs.org/',
    mounting: 'https://test-utils.vuejs.org/guide/',
    api: 'https://test-utils.vuejs.org/api/'
  },

  // Backend Testing
  'convex-test': {
    main: 'https://docs.convex.dev/testing',
    setup: 'https://docs.convex.dev/testing#setting-up-tests',
    functions: 'https://docs.convex.dev/testing#testing-functions'
  },
  supertest: {
    main: 'https://github.com/ladjs/supertest#readme'
  },
  prisma: {
    main: 'https://www.prisma.io/docs/guides/testing',
    mocking: 'https://www.prisma.io/docs/guides/testing/unit-testing'
  },

  // Python
  'pytest-asyncio': {
    main: 'https://pytest-asyncio.readthedocs.io/',
    fixtures: 'https://pytest-asyncio.readthedocs.io/en/latest/how-to-guides/run_session_tests_in_same_loop.html'
  },
  'pytest-mock': {
    main: 'https://pytest-mock.readthedocs.io/'
  }
};

/**
 * Search query templates for different libraries
 */
const SEARCH_QUERY_TEMPLATES = {
  default: [
    '{library} {version} official documentation testing',
    '{library} testing guide API reference',
    'site:docs.{library}.dev {topic}',
    'site:github.com {library} documentation'
  ],
  vitest: [
    'site:vitest.dev {topic}',
    'vitest {version} {topic} guide'
  ],
  playwright: [
    'site:playwright.dev {topic}',
    'playwright {version} testing {topic}'
  ],
  jest: [
    'site:jestjs.io {topic}',
    'jest {version} {topic} documentation'
  ],
  convex: [
    'site:docs.convex.dev {topic}',
    'convex testing {topic}'
  ]
};

/**
 * Documentation sections to fetch per library type
 */
const REQUIRED_SECTIONS = {
  test_runners: [
    'test-lifecycle-hooks',
    'assertions',
    'configuration',
    'mocking',
    'async-testing',
    'timeout-configuration'
  ],
  e2e_frameworks: [
    'locators',
    'assertions',
    'page-objects',
    'network-interception',
    'waiting-strategies',
    'parallel-execution'
  ],
  mocking_libraries: [
    'creating-mocks',
    'module-mocking',
    'spy-functions',
    'mock-implementations',
    'clearing-mocks'
  ],
  component_testing: [
    'rendering',
    'queries',
    'user-events',
    'async-utilities',
    'debugging'
  ],
  backend_testing: [
    'test-setup',
    'database-mocking',
    'api-testing',
    'authentication',
    'transactions'
  ]
};

/**
 * Check which documentation sources are available
 * @param {string[]} available_tools - List of available tool names
 * @returns {Object[]} Available sources sorted by priority
 */
function check_available_sources(available_tools = []) {
  const available = [];

  for (const [name, config] of Object.entries(DOCUMENTATION_SOURCES)) {
    let is_available = false;

    if (config.type === 'mcp') {
      // Check if any of the MCP tools are available
      is_available = config.check_tools.some(tool =>
        available_tools.includes(tool)
      );
    } else if (config.type === 'builtin') {
      // Built-in tools are always available
      is_available = true;
    }

    if (is_available) {
      available.push({
        name,
        ...config,
        is_available: true
      });
    }
  }

  return available.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate documentation fetch instructions for a library
 * @param {Object} library - Library info from detect-test-libraries
 * @param {Object[]} available_sources - Available documentation sources
 * @returns {Object} Fetch instructions
 */
function generate_fetch_instructions(library, available_sources) {
  const instructions = {
    library: library.name,
    version: library.version,
    category: library.category,
    fetch_methods: [],
    required_sections: REQUIRED_SECTIONS[library.category] || [],
    direct_urls: DIRECT_DOC_URLS[library.name] || {}
  };

  for (const source of available_sources) {
    const method = {
      source: source.name,
      priority: source.priority,
      type: source.type
    };

    switch (source.name) {
      case 'dockfork':
        method.tool_call = {
          tool: 'mcp__dockfork__get_documentation',
          params: {
            library: library.name,
            version: library.version,
            sections: instructions.required_sections
          }
        };
        break;

      case 'context7':
        method.tool_call = {
          tool: 'mcp__context7__get_library_docs',
          params: {
            library_name: library.name,
            topic: 'testing patterns and API'
          }
        };
        break;

      case 'websearch':
        const search_templates = SEARCH_QUERY_TEMPLATES[library.name] ||
                                SEARCH_QUERY_TEMPLATES.default;
        method.queries = search_templates.map(template =>
          template
            .replace('{library}', library.name)
            .replace('{version}', library.version)
            .replace('{topic}', 'testing API mocking assertions')
        );
        method.allowed_domains = get_allowed_domains(library.name);
        break;

      case 'webfetch':
        method.urls = Object.entries(instructions.direct_urls).map(([section, url]) => ({
          section,
          url,
          prompt: `Extract ${section} documentation, code examples, and API references for ${library.name}`
        }));
        break;
    }

    instructions.fetch_methods.push(method);
  }

  return instructions;
}

/**
 * Get allowed domains for web search
 * @param {string} library_name - Library name
 * @returns {string[]} Allowed domains
 */
function get_allowed_domains(library_name) {
  const domain_map = {
    vitest: ['vitest.dev', 'github.com/vitest-dev'],
    jest: ['jestjs.io', 'github.com/jestjs'],
    playwright: ['playwright.dev', 'github.com/microsoft/playwright'],
    cypress: ['docs.cypress.io', 'github.com/cypress-io'],
    msw: ['mswjs.io', 'github.com/mswjs'],
    'convex-test': ['docs.convex.dev', 'github.com/get-convex'],
    '@testing-library/react': ['testing-library.com', 'github.com/testing-library'],
    pytest: ['docs.pytest.org', 'github.com/pytest-dev'],
    rspec: ['rspec.info', 'github.com/rspec']
  };

  return domain_map[library_name] || [];
}

/**
 * Generate the complete documentation fetching plan
 * @param {Object} detection_results - Results from detect-test-libraries
 * @param {string[]} available_tools - List of available tool names
 * @returns {Object} Complete fetching plan
 */
function generate_fetch_plan(detection_results, available_tools = []) {
  const available_sources = check_available_sources(available_tools);

  const plan = {
    generated_at: new Date().toISOString(),
    project_path: detection_results.project_path,
    available_sources: available_sources.map(s => ({
      name: s.name,
      priority: s.priority,
      description: s.description
    })),
    libraries_to_fetch: [],
    recommended_fetch_order: []
  };

  // Generate instructions for each library
  for (const library of detection_results.all_libraries) {
    const instructions = generate_fetch_instructions(library, available_sources);
    plan.libraries_to_fetch.push(instructions);
  }

  // Determine fetch order based on library importance
  const priority_order = ['test_runners', 'e2e_frameworks', 'backend_testing', 'mocking_libraries', 'component_testing'];
  plan.recommended_fetch_order = plan.libraries_to_fetch
    .sort((a, b) => {
      const a_priority = priority_order.indexOf(a.category);
      const b_priority = priority_order.indexOf(b.category);
      return (a_priority === -1 ? 99 : a_priority) - (b_priority === -1 ? 99 : b_priority);
    })
    .map(lib => lib.library);

  return plan;
}

/**
 * Generate executable instructions for the agent
 * @param {Object} fetch_plan - Plan from generate_fetch_plan
 * @returns {string} Executable instructions in markdown
 */
function generate_executable_instructions(fetch_plan) {
  const lines = [
    '# Test Documentation Fetching Instructions',
    '',
    `Generated: ${fetch_plan.generated_at}`,
    '',
    '## Available Documentation Sources',
    ''
  ];

  for (const source of fetch_plan.available_sources) {
    lines.push(`${source.priority}. **${source.name}** - ${source.description}`);
  }

  lines.push('');
  lines.push('## Libraries to Fetch');
  lines.push('');
  lines.push(`Fetch in this order: ${fetch_plan.recommended_fetch_order.join(' → ')}`);
  lines.push('');

  for (const lib of fetch_plan.libraries_to_fetch) {
    lines.push(`### ${lib.library}@${lib.version}`);
    lines.push('');
    lines.push(`Category: ${lib.category}`);
    lines.push(`Required sections: ${lib.required_sections.join(', ')}`);
    lines.push('');

    for (const method of lib.fetch_methods) {
      lines.push(`#### Method ${method.priority}: ${method.source}`);
      lines.push('');

      if (method.tool_call) {
        lines.push('```javascript');
        lines.push(`// Call: ${method.tool_call.tool}`);
        lines.push(JSON.stringify(method.tool_call.params, null, 2));
        lines.push('```');
      } else if (method.queries) {
        lines.push('Search queries:');
        for (const query of method.queries) {
          lines.push(`- "${query}"`);
        }
        if (method.allowed_domains?.length) {
          lines.push(`Allowed domains: ${method.allowed_domains.join(', ')}`);
        }
      } else if (method.urls) {
        lines.push('Direct URLs:');
        for (const url_info of method.urls) {
          lines.push(`- ${url_info.section}: ${url_info.url}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Create cache directory and structure
 * @param {string} project_path - Project path
 * @returns {string} Cache directory path
 */
function ensure_cache_directory(project_path) {
  const cache_dir = path.join(project_path, '.agent-os', 'test-context', 'cache');

  if (!fs.existsSync(cache_dir)) {
    fs.mkdirSync(cache_dir, { recursive: true });
  }

  return cache_dir;
}

/**
 * Check if cached documentation exists and is fresh
 * @param {string} project_path - Project path
 * @param {string} library_name - Library name
 * @param {number} max_age_hours - Maximum cache age in hours (default: 24)
 * @returns {Object|null} Cached documentation or null
 */
function get_cached_documentation(project_path, library_name, max_age_hours = 24) {
  const cache_dir = path.join(project_path, '.agent-os', 'test-context', 'cache');
  const cache_file = path.join(cache_dir, `${library_name.replace(/[^a-z0-9]/gi, '_')}.json`);

  if (!fs.existsSync(cache_file)) {
    return null;
  }

  try {
    const cached = JSON.parse(fs.readFileSync(cache_file, 'utf8'));
    const cached_time = new Date(cached.cached_at).getTime();
    const max_age_ms = max_age_hours * 60 * 60 * 1000;

    if (Date.now() - cached_time < max_age_ms) {
      return cached;
    }
  } catch {
    // Invalid cache file
  }

  return null;
}

/**
 * Save documentation to cache
 * @param {string} project_path - Project path
 * @param {string} library_name - Library name
 * @param {Object} documentation - Documentation content
 */
function cache_documentation(project_path, library_name, documentation) {
  const cache_dir = ensure_cache_directory(project_path);
  const cache_file = path.join(cache_dir, `${library_name.replace(/[^a-z0-9]/gi, '_')}.json`);

  const cache_entry = {
    library: library_name,
    cached_at: new Date().toISOString(),
    ...documentation
  };

  fs.writeFileSync(cache_file, JSON.stringify(cache_entry, null, 2));
}

// Export for use as module
module.exports = {
  DOCUMENTATION_SOURCES,
  DIRECT_DOC_URLS,
  SEARCH_QUERY_TEMPLATES,
  REQUIRED_SECTIONS,
  check_available_sources,
  generate_fetch_instructions,
  generate_fetch_plan,
  generate_executable_instructions,
  get_cached_documentation,
  cache_documentation,
  ensure_cache_directory
};

// CLI support
if (require.main === module) {
  const { detect_test_libraries } = require('./detect-test-libraries');

  const args = process.argv.slice(2);
  const project_path = args[0] || process.cwd();
  const output_format = args.includes('--json') ? 'json' : 'markdown';

  // Simulate available tools (in real usage, this comes from the agent environment)
  const simulated_tools = args.includes('--with-mcp')
    ? ['mcp__context7__get_library_docs', 'WebSearch', 'WebFetch']
    : ['WebSearch', 'WebFetch'];

  try {
    const detection_results = detect_test_libraries(project_path);
    const fetch_plan = generate_fetch_plan(detection_results, simulated_tools);

    if (output_format === 'json') {
      console.log(JSON.stringify(fetch_plan, null, 2));
    } else {
      console.log(generate_executable_instructions(fetch_plan));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
