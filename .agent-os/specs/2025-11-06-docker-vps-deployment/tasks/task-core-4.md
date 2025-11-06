# Task: core-4 - Create .dockerignore Optimization

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 15 minutes
**Dependencies:** core-2

---

## Description

Create a comprehensive .dockerignore file to optimize Docker build performance by excluding unnecessary files from the build context, reducing image size and build time.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/.dockerignore`

**Goals:**
1. Exclude development dependencies and artifacts
2. Exclude version control and CI/CD files
3. Exclude documentation and test files
4. Exclude OS-specific files
5. Reduce build context size by 50%+ (target)

**Categories to exclude:**
- Node.js artifacts (node_modules, .npm)
- Next.js build artifacts (.next, out)
- Testing files and coverage reports
- Git repository and history
- IDE configuration files
- Documentation files (markdown, except essential)
- Environment files (except examples)
- Log files and temporary files
- OS-specific files (.DS_Store, Thumbs.db)

---

## Acceptance Criteria

- [ ] .dockerignore file created at project root
- [ ] All development dependencies excluded
- [ ] Build artifacts excluded
- [ ] Version control files excluded
- [ ] Test files and coverage reports excluded
- [ ] Documentation files excluded (except README)
- [ ] IDE config files excluded
- [ ] Log files excluded
- [ ] OS-specific files excluded
- [ ] .env files excluded (except .env.example)
- [ ] Docker build time reduced measurably
- [ ] Build context size reduced by 50%+
- [ ] Essential files NOT excluded (package.json, source code)

---

## Testing Requirements

**Build context validation:**
```bash
# Check build context size BEFORE .dockerignore
docker build --no-cache -t test-context . 2>&1 | grep "Sending build context"

# Create .dockerignore file

# Check build context size AFTER .dockerignore
docker build --no-cache -t test-context . 2>&1 | grep "Sending build context"

# Compare reduction
# Expected: 50%+ reduction in context size

# Verify essential files included
docker build -t test-build .
# Should succeed without missing file errors

# Clean up
docker rmi test-context test-build
```

**Integration validation:**
- Docker build (core-2) should complete faster
- No missing file errors during build

---

## Evidence Requirements

**Completion evidence:**
1. .dockerignore file committed to project root
2. Build context size comparison (before/after)
3. Build time comparison (before/after)
4. Successful Docker build confirming no missing files

**Documentation:**
- Inline comments categorizing exclusions
- Size reduction metrics documented

---

## Context Requirements

**Required knowledge:**
- .dockerignore syntax and patterns
- Next.js project structure
- Node.js project artifacts
- Docker build context behavior

**Files to reference:**
- .gitignore (for pattern ideas)
- Project directory structure
- Docker documentation on .dockerignore

---

## Implementation Notes

**.dockerignore structure:**

```dockerignore
# Documentation
*.md
!README.md
docs/
.agent-os/

# Version Control
.git/
.gitignore
.gitattributes

# Dependencies
node_modules/
.npm/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/
*.test.js
*.test.ts
*.spec.js
*.spec.ts
__tests__/
tests/
.jest/

# Build Artifacts
.next/
out/
dist/
build/
.turbo/

# Environment Files
.env
.env*.local
!.env.example
!.env.production.example

# IDE and Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml
.circleci/

# Temporary Files
tmp/
temp/
*.tmp

# OS-specific
Thumbs.db
.DS_Store
desktop.ini

# Miscellaneous
*.orig
*.rej
.cache/
.parcel-cache/
```

**Optimization strategy:**
1. Start broad, exclude entire categories
2. Use negation (!) to include essential files
3. Test build after each major exclusion
4. Monitor build context size reduction
5. Verify no missing file errors

**Essential inclusions:**
- package.json and package-lock.json (dependencies)
- Source code (app/, components/, lib/, etc.)
- Configuration files (next.config.js, payload.config.ts, tsconfig.json)
- Public assets (public/)
- .env.example files (documentation)

**Impact metrics:**
- Build context size: Expect 50-80% reduction
- Build time: Expect 10-30% reduction
- Image size: Indirect benefit (smaller context = faster builds)

**Common mistakes to avoid:**
- Don't exclude source code directories
- Don't exclude configuration files needed for build
- Don't exclude package.json/package-lock.json
- Do test build after creating .dockerignore
- Do measure impact to validate effectiveness

---

## Next Steps

After completing this task:
1. Measure build context size reduction
2. Verify Docker build still succeeds
3. Document size/time improvements
4. Continue with other core infrastructure tasks

**Note:** This task can run in parallel with core-3. Both optimize different aspects of Docker setup.
