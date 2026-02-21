# CLAUDE.md - Paul Thames Superyacht Technology

This project uses [Agent OS](.agent-os/CLAUDE.md) for orchestration and [bd (beads)](https://github.com/steveyegge/beads) for issue tracking. Follow [AGENTS.md](AGENTS.md).

## Commands

```bash
npm run dev              # Dev server at localhost:3000 (CMS admin at /admin)
npm run dev:e2e          # Dev with mocked external services
npm run dev:clean        # Kill existing servers + restart
npm run stop:dev         # Stop all dev servers
npm run build            # Production build
npm run test             # Jest unit tests
npm run test:e2e         # Playwright E2E tests
npm run type-check       # TypeScript validation
npm run lint             # ESLint
```

## Architecture (non-obvious patterns)

- **Static-first**: All pages pre-built at build time. All data must be available during `npm run build`.
- **Data access**: ALWAYS use `PayloadCMSDataService` methods (`lib/payload-cms-data-service.ts`), never direct DB queries.
- **Vendor-Partner unification**: Single `Vendor` model with `partner` boolean flag, not separate models.
- **New content types**: Define in `payload.config.ts` → types in `lib/types.ts` → transform in data service.

## Payload CMS Gotchas

- Collections may be referenced by **string only** (e.g., `collection: 'notifications'`), not imports. TypeScript and LSP won't find these.
- `payload.config.ts` references components via **string paths** (e.g., `'@/payload/components/LogoutButton#LogoutButton'`). Not visible as imports.
- Before deleting any file, verify with **multiple tools**: Serena `search_for_pattern`, LSP `findReferences`, AND Grep.

## E2E Testing

```bash
npm run build && npm run start:e2e   # Production server with E2E config
npm run test:e2e                      # Run Playwright tests
```

E2E flags (set in `.env.e2e`): `DISABLE_RATE_LIMIT`, `DISABLE_EMAILS`, `MOCK_GEOCODING`, `DISABLE_CAPTCHA` (all `=true`).

## Environment Variables

Required: `PAYLOAD_SECRET`. Optional: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_EMAIL_ADDRESS`, `NEXT_PUBLIC_BASE_URL`. Database: `DATABASE_URL` (SQLite default: `file:./data/payload.db`; PostgreSQL: set `USE_POSTGRES=true`). See `Supporting-Docs/database-migration/QUICK-REFERENCE.md`.

## Tool Usage — IMPORTANT

You have powerful MCP tools. Use them in this priority order to minimize token cost and maximize accuracy.

### Code Navigation & Understanding (prefer Serena)

**IMPORTANT: Default to Serena's symbolic tools for code exploration.** Do NOT read entire files or grep blindly when Serena can give you precise, token-efficient answers.

| Task | Use This | NOT This |
|------|----------|----------|
| Understand a file's structure | `serena::get_symbols_overview` | Reading the entire file |
| Find a function/class/method | `serena::find_symbol` (with `include_body=true` only when needed) | Grep for function name |
| See who calls a function | `serena::find_referencing_symbols` | Grep for the function name across all files |
| Search for a pattern in code | `serena::search_for_pattern` (supports regex, glob filters, context lines) | Grep tool |
| Replace a function/method body | `serena::replace_symbol_body` | Read file + Edit tool |
| Add code after/before a symbol | `serena::insert_after_symbol` / `insert_before_symbol` | Read file + Edit tool |
| Rename a symbol | `serena::rename_symbol` | Find-and-replace across files |

**When Serena is NOT the right choice:**
- Editing a few lines within a large function → use `Edit` tool (more precise for partial changes)
- Searching non-code files (YAML, JSON, MD, HTML) → use `Grep` or `serena::search_for_pattern` with `restrict_search_to_code_files=false`
- Finding files by name/pattern → use `Glob`
- Quick one-off string search you're confident about → `Grep` is fine

### Serena Workflow (token-efficient pattern)

1. `get_symbols_overview(relative_path)` — see file structure without reading it
2. `find_symbol(name_path, depth=1)` — drill into a class to see its methods
3. `find_symbol(name_path, include_body=true)` — read only the specific method you need
4. `find_referencing_symbols` — understand call sites before editing
5. `replace_symbol_body` / `insert_after_symbol` — make surgical edits

### Drift (Pattern Enforcement)

Use Drift MCP tools to stay consistent with codebase conventions. Run `drift_capabilities` to discover available tools.

- **Before coding**: `drift_context(intent, focus)` — get relevant patterns and examples
- **Quick lookups**: `drift_signature`, `drift_callers`, `drift_imports`, `drift_type` — fast, low-token
- **After coding**: `drift_validate_change` — verify your code matches patterns
- **Before commits**: `drift check --staged` via Bash

### LSP Tools

Use the built-in LSP tool for:
- `goToDefinition` — jump to where something is defined
- `findReferences` — all usages of a symbol (complements Serena's `find_referencing_symbols`)
- `hover` — type info and docs at a position

### Browser Testing

Prefer the `agent-browser` skill over writing Playwright scripts for quick interactive verification. Use Playwright for persistent test suites committed to the codebase.

## Feature Documentation

Detailed docs live in `Supporting-Docs/`: geocoding, tier system, email notifications, database migration. Check there before asking questions about these features.
