# Task Completion Checklist

When completing coding tasks, always run:

## Code Quality Checks
1. **Lint**: `npm run lint` - Fix any ESLint errors
2. **Type Check**: `npx tsc --noEmit` - Ensure no TypeScript errors
3. **Build Test**: `npm run build` - Verify production build works

## Testing
- No specific test framework configured yet
- Manual testing by running the application

## Before Committing
1. Run lint and fix issues
2. Ensure both Next.js and CMS still work
3. Test key functionality manually
4. Check that build passes

## Development Workflow
1. Start development: `./scripts/dev-with-cms.sh`
2. Make changes
3. Test in browser (localhost:3000)
4. Check CMS admin if relevant (localhost:3001/admin)
5. Run quality checks before committing