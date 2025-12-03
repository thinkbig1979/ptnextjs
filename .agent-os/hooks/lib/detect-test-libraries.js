/**
 * Test Library Detection Utility
 *
 * Analyzes project dependency files to detect testing libraries,
 * their versions, and associated configuration files.
 *
 * @version 1.0.0
 * @module detect-test-libraries
 */

const fs = require('fs');
const path = require('path');

/**
 * Known testing library categories
 */
const LIBRARY_CATEGORIES = {
  test_runners: {
    javascript: ['jest', 'vitest', 'mocha', 'ava', 'tap', 'node:test', 'uvu'],
    python: ['pytest', 'unittest', 'nose2', 'ward'],
    ruby: ['rspec', 'minitest', 'test-unit']
  },
  assertion_libraries: {
    javascript: ['chai', 'expect.js', 'should', 'power-assert'],
    python: ['assertpy', 'expects', 'sure'],
    ruby: ['shoulda-matchers', 'rspec-expectations']
  },
  mocking_libraries: {
    javascript: ['sinon', 'testdouble', 'nock', 'msw', 'jest-mock-extended'],
    python: ['pytest-mock', 'responses', 'httpretty', 'freezegun', 'factory-boy'],
    ruby: ['mocha', 'webmock', 'vcr', 'factory_bot']
  },
  e2e_frameworks: {
    javascript: ['playwright', '@playwright/test', 'cypress', 'puppeteer', 'selenium-webdriver', 'testcafe'],
    python: ['playwright', 'selenium', 'splinter', 'pyppeteer'],
    ruby: ['capybara', 'selenium-webdriver', 'watir']
  },
  component_testing: {
    javascript: [
      '@testing-library/react',
      '@testing-library/vue',
      '@testing-library/angular',
      '@testing-library/svelte',
      '@testing-library/dom',
      '@vue/test-utils',
      'enzyme',
      'react-test-renderer'
    ]
  },
  backend_testing: {
    javascript: ['supertest', 'convex-test', 'prisma', 'drizzle-orm'],
    python: ['pytest-django', 'pytest-asyncio', 'httpx', 'pytest-flask'],
    ruby: ['rack-test', 'database_cleaner', 'rspec-rails']
  },
  coverage: {
    javascript: ['c8', 'nyc', 'istanbul', '@vitest/coverage-v8', '@vitest/coverage-istanbul'],
    python: ['coverage', 'pytest-cov'],
    ruby: ['simplecov']
  }
};

/**
 * Documentation URLs for common libraries
 */
const DOCUMENTATION_URLS = {
  // Test Runners
  'jest': 'https://jestjs.io/docs/api',
  'vitest': 'https://vitest.dev/api/',
  'mocha': 'https://mochajs.org/#getting-started',
  'pytest': 'https://docs.pytest.org/en/stable/',
  'rspec': 'https://rspec.info/documentation/',

  // E2E Frameworks
  'playwright': 'https://playwright.dev/docs/api/class-test',
  '@playwright/test': 'https://playwright.dev/docs/api/class-test',
  'cypress': 'https://docs.cypress.io/api/table-of-contents',
  'puppeteer': 'https://pptr.dev/api',

  // Mocking
  'msw': 'https://mswjs.io/docs/',
  'sinon': 'https://sinonjs.org/releases/latest/',
  'nock': 'https://github.com/nock/nock#readme',

  // Component Testing
  '@testing-library/react': 'https://testing-library.com/docs/react-testing-library/intro',
  '@testing-library/vue': 'https://testing-library.com/docs/vue-testing-library/intro',
  '@vue/test-utils': 'https://test-utils.vuejs.org/',

  // Backend
  'convex-test': 'https://docs.convex.dev/testing',
  'supertest': 'https://github.com/ladjs/supertest#readme',
  'prisma': 'https://www.prisma.io/docs/guides/testing',

  // Python
  'pytest-asyncio': 'https://pytest-asyncio.readthedocs.io/',
  'pytest-django': 'https://pytest-django.readthedocs.io/',

  // Ruby
  'capybara': 'https://github.com/teamcapybara/capybara#readme',
  'factory_bot': 'https://github.com/thoughtbot/factory_bot#readme'
};

/**
 * Config file patterns for testing frameworks
 */
const CONFIG_PATTERNS = {
  'jest': ['jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.cjs'],
  'vitest': ['vitest.config.js', 'vitest.config.ts', 'vitest.config.mjs', 'vite.config.ts', 'vite.config.js'],
  'playwright': ['playwright.config.js', 'playwright.config.ts'],
  'cypress': ['cypress.config.js', 'cypress.config.ts', 'cypress.json'],
  'mocha': ['.mocharc.js', '.mocharc.json', '.mocharc.yml', 'mocha.opts'],
  'pytest': ['pytest.ini', 'pyproject.toml', 'setup.cfg', 'conftest.py'],
  'rspec': ['.rspec', 'spec/spec_helper.rb', 'spec/rails_helper.rb']
};

/**
 * Detect project language based on files present
 * @param {string} project_path - Path to project root
 * @returns {string[]} Array of detected languages
 */
function detect_languages(project_path) {
  const languages = [];
  const files_to_check = {
    javascript: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
    typescript: ['tsconfig.json', 'tsconfig.*.json'],
    python: ['pyproject.toml', 'setup.py', 'requirements.txt', 'Pipfile', 'poetry.lock'],
    ruby: ['Gemfile', 'Gemfile.lock', '*.gemspec']
  };

  for (const [lang, patterns] of Object.entries(files_to_check)) {
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Glob pattern - check if any matching files exist
        const dir = path.dirname(path.join(project_path, pattern));
        const base_pattern = path.basename(pattern).replace('*', '');
        try {
          const files = fs.readdirSync(dir === '.' ? project_path : dir);
          if (files.some(f => f.includes(base_pattern))) {
            languages.push(lang);
            break;
          }
        } catch {
          // Directory doesn't exist
        }
      } else {
        const file_path = path.join(project_path, pattern);
        if (fs.existsSync(file_path)) {
          languages.push(lang);
          break;
        }
      }
    }
  }

  // TypeScript is often used with JavaScript
  if (languages.includes('typescript') && !languages.includes('javascript')) {
    languages.push('javascript');
  }

  return [...new Set(languages)];
}

/**
 * Parse package.json for testing dependencies
 * @param {string} project_path - Path to project root
 * @returns {Object} Detected JavaScript/TypeScript testing libraries
 */
function parse_package_json(project_path) {
  const package_path = path.join(project_path, 'package.json');
  if (!fs.existsSync(package_path)) {
    return { libraries: [], dev_dependencies: {}, dependencies: {} };
  }

  try {
    const package_json = JSON.parse(fs.readFileSync(package_path, 'utf8'));
    const dev_deps = package_json.devDependencies || {};
    const deps = package_json.dependencies || {};
    const all_deps = { ...deps, ...dev_deps };

    const libraries = [];
    const all_known_libraries = get_all_known_libraries('javascript');

    for (const [name, version] of Object.entries(all_deps)) {
      if (all_known_libraries.includes(name)) {
        libraries.push({
          name,
          version: clean_version(version),
          source: dev_deps[name] ? 'devDependencies' : 'dependencies',
          category: get_library_category(name, 'javascript'),
          documentation_url: DOCUMENTATION_URLS[name] || null,
          config_file: find_config_file(project_path, name)
        });
      }
    }

    return {
      libraries,
      dev_dependencies: dev_deps,
      dependencies: deps
    };
  } catch (error) {
    console.error(`Error parsing package.json: ${error.message}`);
    return { libraries: [], dev_dependencies: {}, dependencies: {} };
  }
}

/**
 * Parse Python dependency files
 * @param {string} project_path - Path to project root
 * @returns {Object} Detected Python testing libraries
 */
function parse_python_deps(project_path) {
  const libraries = [];
  const all_known_libraries = get_all_known_libraries('python');

  // Check pyproject.toml
  const pyproject_path = path.join(project_path, 'pyproject.toml');
  if (fs.existsSync(pyproject_path)) {
    try {
      const content = fs.readFileSync(pyproject_path, 'utf8');
      // Basic TOML parsing for dependencies
      const dev_deps_match = content.match(/\[project\.optional-dependencies\]\s*dev\s*=\s*\[([\s\S]*?)\]/);
      const deps_match = content.match(/\[project\]\s*[\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);

      const parse_deps = (match) => {
        if (!match) return [];
        return match[1]
          .split('\n')
          .map(line => line.trim().replace(/['"]/g, '').replace(/,/g, ''))
          .filter(line => line && !line.startsWith('#'))
          .map(dep => {
            const [name, version] = dep.split(/[<>=~!]+/);
            return { name: name.trim().toLowerCase(), version: version?.trim() || 'latest' };
          });
      };

      [...parse_deps(deps_match), ...parse_deps(dev_deps_match)].forEach(dep => {
        if (all_known_libraries.includes(dep.name)) {
          libraries.push({
            name: dep.name,
            version: dep.version,
            source: 'pyproject.toml',
            category: get_library_category(dep.name, 'python'),
            documentation_url: DOCUMENTATION_URLS[dep.name] || null,
            config_file: find_config_file(project_path, dep.name)
          });
        }
      });
    } catch (error) {
      console.error(`Error parsing pyproject.toml: ${error.message}`);
    }
  }

  // Check requirements files
  const req_files = ['requirements.txt', 'requirements-dev.txt', 'requirements-test.txt'];
  for (const req_file of req_files) {
    const req_path = path.join(project_path, req_file);
    if (fs.existsSync(req_path)) {
      try {
        const content = fs.readFileSync(req_path, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) return;

          const [name, version] = trimmed.split(/[<>=~!]+/);
          const clean_name = name.trim().toLowerCase();

          if (all_known_libraries.includes(clean_name)) {
            if (!libraries.some(l => l.name === clean_name)) {
              libraries.push({
                name: clean_name,
                version: version?.trim() || 'latest',
                source: req_file,
                category: get_library_category(clean_name, 'python'),
                documentation_url: DOCUMENTATION_URLS[clean_name] || null,
                config_file: find_config_file(project_path, clean_name)
              });
            }
          }
        });
      } catch (error) {
        console.error(`Error parsing ${req_file}: ${error.message}`);
      }
    }
  }

  return { libraries };
}

/**
 * Parse Ruby Gemfile
 * @param {string} project_path - Path to project root
 * @returns {Object} Detected Ruby testing libraries
 */
function parse_gemfile(project_path) {
  const gemfile_path = path.join(project_path, 'Gemfile');
  if (!fs.existsSync(gemfile_path)) {
    return { libraries: [] };
  }

  const libraries = [];
  const all_known_libraries = get_all_known_libraries('ruby');

  try {
    const content = fs.readFileSync(gemfile_path, 'utf8');
    const gem_regex = /gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?/g;
    let match;

    while ((match = gem_regex.exec(content)) !== null) {
      const name = match[1];
      const version = match[2] || 'latest';

      if (all_known_libraries.includes(name)) {
        libraries.push({
          name,
          version: clean_version(version),
          source: 'Gemfile',
          category: get_library_category(name, 'ruby'),
          documentation_url: DOCUMENTATION_URLS[name] || null,
          config_file: find_config_file(project_path, name)
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing Gemfile: ${error.message}`);
  }

  return { libraries };
}

/**
 * Get all known libraries for a language
 * @param {string} language - Language name
 * @returns {string[]} Array of library names
 */
function get_all_known_libraries(language) {
  const libraries = [];
  for (const category of Object.values(LIBRARY_CATEGORIES)) {
    if (category[language]) {
      libraries.push(...category[language]);
    }
  }
  return libraries;
}

/**
 * Get category for a library
 * @param {string} library_name - Library name
 * @param {string} language - Language name
 * @returns {string} Category name
 */
function get_library_category(library_name, language) {
  for (const [category, langs] of Object.entries(LIBRARY_CATEGORIES)) {
    if (langs[language]?.includes(library_name)) {
      return category;
    }
  }
  return 'unknown';
}

/**
 * Find config file for a library
 * @param {string} project_path - Project path
 * @param {string} library_name - Library name
 * @returns {string|null} Config file path or null
 */
function find_config_file(project_path, library_name) {
  const patterns = CONFIG_PATTERNS[library_name];
  if (!patterns) return null;

  for (const pattern of patterns) {
    const file_path = path.join(project_path, pattern);
    if (fs.existsSync(file_path)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Clean version string
 * @param {string} version - Raw version string
 * @returns {string} Cleaned version
 */
function clean_version(version) {
  if (!version) return 'latest';
  return version.replace(/^[\^~>=<]+/, '').trim();
}

/**
 * Main detection function
 * @param {string} project_path - Path to project root
 * @returns {Object} Complete detection results
 */
function detect_test_libraries(project_path = process.cwd()) {
  const resolved_path = path.resolve(project_path);

  if (!fs.existsSync(resolved_path)) {
    throw new Error(`Project path does not exist: ${resolved_path}`);
  }

  const languages = detect_languages(resolved_path);
  const results = {
    project_path: resolved_path,
    detected_at: new Date().toISOString(),
    languages,
    libraries: {
      test_runner: null,
      e2e_framework: null,
      mocking: [],
      component_testing: [],
      backend_testing: [],
      coverage: [],
      other: []
    },
    all_libraries: [],
    documentation_urls: {}
  };

  // Parse based on detected languages
  if (languages.includes('javascript') || languages.includes('typescript')) {
    const js_result = parse_package_json(resolved_path);
    results.all_libraries.push(...js_result.libraries);
  }

  if (languages.includes('python')) {
    const py_result = parse_python_deps(resolved_path);
    results.all_libraries.push(...py_result.libraries);
  }

  if (languages.includes('ruby')) {
    const rb_result = parse_gemfile(resolved_path);
    results.all_libraries.push(...rb_result.libraries);
  }

  // Categorize libraries
  for (const lib of results.all_libraries) {
    // Add documentation URL
    if (lib.documentation_url) {
      results.documentation_urls[lib.name] = lib.documentation_url;
    }

    // Categorize
    switch (lib.category) {
      case 'test_runners':
        if (!results.libraries.test_runner) {
          results.libraries.test_runner = lib;
        }
        break;
      case 'e2e_frameworks':
        if (!results.libraries.e2e_framework) {
          results.libraries.e2e_framework = lib;
        }
        break;
      case 'mocking_libraries':
        results.libraries.mocking.push(lib);
        break;
      case 'component_testing':
        results.libraries.component_testing.push(lib);
        break;
      case 'backend_testing':
        results.libraries.backend_testing.push(lib);
        break;
      case 'coverage':
        results.libraries.coverage.push(lib);
        break;
      default:
        results.libraries.other.push(lib);
    }
  }

  return results;
}

/**
 * Generate summary for test-context-gatherer
 * @param {Object} detection_results - Results from detect_test_libraries
 * @returns {string} Human-readable summary
 */
function generate_summary(detection_results) {
  const lines = [
    '═══════════════════════════════════════════════════════════════════',
    'TEST LIBRARY DETECTION RESULTS',
    '═══════════════════════════════════════════════════════════════════',
    '',
    `Project: ${detection_results.project_path}`,
    `Languages: ${detection_results.languages.join(', ')}`,
    `Detected at: ${detection_results.detected_at}`,
    ''
  ];

  if (detection_results.libraries.test_runner) {
    const tr = detection_results.libraries.test_runner;
    lines.push(`Test Runner: ${tr.name}@${tr.version}`);
    if (tr.config_file) lines.push(`  Config: ${tr.config_file}`);
    if (tr.documentation_url) lines.push(`  Docs: ${tr.documentation_url}`);
    lines.push('');
  }

  if (detection_results.libraries.e2e_framework) {
    const e2e = detection_results.libraries.e2e_framework;
    lines.push(`E2E Framework: ${e2e.name}@${e2e.version}`);
    if (e2e.config_file) lines.push(`  Config: ${e2e.config_file}`);
    if (e2e.documentation_url) lines.push(`  Docs: ${e2e.documentation_url}`);
    lines.push('');
  }

  if (detection_results.libraries.mocking.length > 0) {
    lines.push('Mocking Libraries:');
    for (const lib of detection_results.libraries.mocking) {
      lines.push(`  - ${lib.name}@${lib.version}`);
    }
    lines.push('');
  }

  if (detection_results.libraries.component_testing.length > 0) {
    lines.push('Component Testing:');
    for (const lib of detection_results.libraries.component_testing) {
      lines.push(`  - ${lib.name}@${lib.version}`);
    }
    lines.push('');
  }

  if (detection_results.libraries.backend_testing.length > 0) {
    lines.push('Backend Testing:');
    for (const lib of detection_results.libraries.backend_testing) {
      lines.push(`  - ${lib.name}@${lib.version}`);
    }
    lines.push('');
  }

  lines.push(`Total libraries detected: ${detection_results.all_libraries.length}`);
  lines.push('═══════════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// Export for use as module
module.exports = {
  detect_test_libraries,
  generate_summary,
  LIBRARY_CATEGORIES,
  DOCUMENTATION_URLS,
  CONFIG_PATTERNS
};

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const project_path = args[0] || process.cwd();
  const output_format = args.includes('--json') ? 'json' : 'summary';

  try {
    const results = detect_test_libraries(project_path);

    if (output_format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(generate_summary(results));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
