# Phase 4 - Frontend-Backend Integration Testing
## INTEG-FRONTEND-BACKEND Task Deliverable Manifest

**Task ID**: INTEG-FRONTEND-BACKEND
**Phase**: Phase 4 - Frontend-Backend Integration
**Agent**: integration-coordinator (task-orchestrator + pwtester)
**Time Estimate**: 25-30 minutes
**Status**: In Progress

## Deliverable Files

### Test Files (Primary Deliverables)

1. **Full-Stack Integration Test Suite**
   - **Path**: `/home/edwin/development/ptnextjs/__tests__/e2e/integration/full-stack-locations.test.ts`
   - **Purpose**: Comprehensive E2E tests covering UI → API → Database → API → UI workflows
   - **Test Count Target**: 20+ test cases
   - **Coverage Areas**:
     - Dashboard location management (8 tests)
     - Public profile display (6 tests)
     - Geocoding integration (4 tests)
     - Tier-based access control (3 tests)

## Test Suite Breakdown

### Suite 1: Dashboard Location Management (8 tests)
1. **Add Location Workflow** - Complete flow from UI to database
   - Navigate to dashboard → Add location → Fill form → Geocode → Save
   - Verify database has new location → Navigate to public profile → Verify display

2. **Edit Location Workflow** - Update persistence validation
   - Edit existing location → Change address → Save
   - Check database updated → Refresh page → Verify changes persist

3. **Delete Location Workflow** - Removal verification
   - Delete location → Confirm dialog → Verify removed from database
   - Check UI updated immediately

4. **HQ Designation** - Uniqueness constraint validation
   - Mark location as HQ → Verify other locations not HQ
   - Check database constraint enforced

5. **Form Validation** - Invalid data rejection
   - Enter invalid coordinates (lat: 999) → Attempt save
   - Error shown → Database not updated

6. **Tier2 Multiple Locations** - Premium feature access
   - Add 5 locations → All save successfully
   - All visible on profile

7. **Tier1 Restriction** - Access control enforcement
   - Login tier1 vendor → Attempt to add 2nd location
   - Blocked with upgrade prompt

8. **Optimistic UI Updates** - UI state management
   - Save location → UI updates immediately
   - Simulate API error → Verify rollback

### Suite 2: Public Profile Display (6 tests)
1. **Tier2 Display** - Multiple locations rendering
   - Create tier2 vendor with 3 locations
   - Navigate to profile → All locations on map → All cards in list

2. **Tier1 Filtering** - Single location display
   - Create tier1 vendor with 3 locations (1 HQ, 2 regular)
   - Navigate to profile → Only HQ shown

3. **Map Interactions** - Marker functionality
   - Click map marker → Popup opens
   - Verify correct address and details

4. **Directions Link** - External integration
   - Click 'Get Directions' → Verify Google Maps URL correct

5. **Responsive Design** - Mobile compatibility
   - Resize to mobile → Verify map stacks above list
   - Both visible and functional

6. **Empty State** - Graceful degradation
   - Vendor with no locations → Profile shows 'No locations' message

### Suite 3: Geocoding Integration (4 tests)
1. **Geocode Success** - API integration
   - Enter 'Port de Monaco' → Click geocode
   - Verify coordinates populate → Save → Check database

2. **Geocode Error** - Error handling
   - Enter invalid address → Click geocode
   - Error toast → Coordinates unchanged

3. **Geocode Cancellation** - Request management
   - Start geocode → Immediately start another
   - Only latest completes

4. **Manual Override** - User control
   - Geocode address → Manually change coordinates
   - Save → Manual values in database

### Suite 4: Tier Access Control (3 tests)
1. **Free Tier** - Restricted access
   - Login free vendor → Dashboard
   - Upgrade prompt shown → No location manager

2. **Tier2 Access** - Full feature access
   - Login tier2 vendor → Dashboard
   - Location manager visible → Can add/edit

3. **Admin Bypass** - Administrative override
   - Login admin → View any vendor
   - Full access regardless of tier

## Verification Criteria

### Technical Requirements
- [x] Use Playwright for browser automation
- [x] Test with actual database (not mocked)
- [x] Test with real API server
- [x] Verify database state after operations
- [x] Test multiple browser sessions (different tiers)
- [x] Verify SWR cache behavior
- [x] Screenshot on failure
- [x] Proper async/await handling

### Acceptance Criteria
- [ ] E2E integration test file created
- [ ] Full workflow tests cover UI → API → DB → API → UI
- [ ] Geocoding integration works end-to-end
- [ ] Tier restriction enforcement across layers
- [ ] HQ uniqueness validation across layers
- [ ] Optimistic UI updates and rollback
- [ ] Data consistency verified
- [ ] 20+ tests passing
- [ ] Works in production build

## Integration Points Tested

### UI Layer
- Dashboard location form components
- Public profile map display
- Location cards and list views
- Tier gate components
- Error handling and toast notifications
- Optimistic UI updates

### API Layer
- `/api/portal/vendors/[id]` - Vendor profile updates
- `/api/geocode` - Address to coordinates conversion
- Authentication and authorization middleware
- Tier-based access control

### Database Layer
- Vendor locations table
- HQ uniqueness constraint
- Location data persistence
- Transaction integrity
- Referential integrity

### State Management
- SWR cache invalidation
- Optimistic updates
- Error rollback
- Session state

## Test Execution Plan

### Phase 1: Test Creation
1. Create test file with proper imports and setup
2. Implement test fixtures and helpers
3. Write test cases following specification
4. Add database verification logic

### Phase 2: Test Execution
1. Start development server
2. Run test suite with Playwright
3. Capture screenshots/videos on failure
4. Collect test results and metrics

### Phase 3: Verification
1. Verify all 20+ tests execute
2. Document pass/fail status
3. Investigate any failures
4. Collect evidence (screenshots, logs)

### Phase 4: Reporting
1. Create execution summary
2. Document integration issues found
3. Update task completion status
4. Archive evidence files

## Success Metrics

- **Test Count**: ≥ 20 test cases
- **Pass Rate**: ≥ 95% (19/20 passing)
- **Coverage**: All 4 test suites executed
- **Performance**: Tests complete in < 5 minutes
- **Reliability**: No flaky tests (consistent results)

## Evidence Collection

### Screenshots
- Map rendering on public profile
- Dashboard location manager UI
- Tier restriction prompts
- Error states and validation messages
- Mobile responsive views

### Logs
- API request/response logs
- Database query logs
- Console errors/warnings
- Test execution output

### Metrics
- Test execution duration
- Pass/fail counts per suite
- Database query performance
- API response times

## Notes

- Tests use Playwright's built-in retry mechanism for stability
- Database state is verified using direct queries or API calls
- Test data is cleaned up after each test run
- Screenshots are captured only on failure to save space
- Tests can run in headless mode for CI/CD integration
