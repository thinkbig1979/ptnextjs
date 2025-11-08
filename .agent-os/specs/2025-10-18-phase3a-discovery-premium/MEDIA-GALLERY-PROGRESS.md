# Media Gallery Implementation Progress

**Branch**: `vendor-media-gallery`
**Beads Task**: `ptnextjs-wpx` (P1)
**Status**: 60% Complete
**Last Updated**: 2025-11-08

---

## ✅ Completed Work

### 1. Type Definitions (lib/types.ts)
- ✅ Added `MediaGalleryItemType` type ('image' | 'video')
- ✅ Added `MediaGalleryItem` interface with full fields:
  - id, type, url, filename, caption, altText
  - album (for organization)
  - order (for sorting)
  - thumbnailUrl, duration, videoPlatform (for videos)
  - uploadedAt timestamp
- ✅ Added `mediaGallery?: MediaGalleryItem[]` to Vendor interface

### 2. Database Schema (payload/collections/Vendors.ts)
- ✅ Added `mediaGallery` array field to Vendors collection
- ✅ Tier 1+ access control configured
- ✅ Conditional field display based on media type:
  - Image type: shows `media` upload field
  - Video type: shows `videoUrl` text field
- ✅ Fields included:
  - type (select: image/video)
  - media (upload relationship to 'media' collection)
  - videoUrl (text with URL sanitization hook)
  - caption (500 char max)
  - altText (255 char, images only)
  - album (255 char for categorization)
  - order (number for sorting)

### 3. Pattern Analysis
Analyzed existing dashboard components to identify patterns:

**ExcelImportCard.tsx**:
- Native HTML5 drag-and-drop (no external libraries)
- `isDragging` state for visual feedback
- File input ref for click-to-upload
- `uploadFile()` utility with progress tracking
- Card-based layout with CardHeader, CardContent, CardFooter

**BasicInfoForm.tsx**:
- react-hook-form + zod validation
- `useVendorDashboard()` context hook
- Form state management with `markDirty()`
- Character count indicators
- Save button in footer with loading state

**Common Patterns**:
- shadcn/ui components (Card, Button, Input, etc.)
- sonner for toast notifications
- Lucide React icons
- Consistent error handling
- Loading states with spinners

---

## 🔨 In Progress

### MediaGalleryManager Component
**Status**: Needs refactor to follow established patterns

**Requirements**:
1. Use Card-based layout (not div wrapper)
2. Native HTML5 drag-and-drop (like ExcelImportCard)
3. File input ref for click upload
4. Album filtering with Select component
5. Grid display of media items
6. Dialogs for add/edit using shadcn Dialog
7. Integration with useVendorDashboard() context

---

## 📋 Remaining Tasks

### High Priority

#### 1. MediaGalleryManager Component (2-3 hours)
**File**: `app/(site)/vendor/dashboard/components/MediaGalleryManager.tsx`

**Structure**:
```tsx
export function MediaGalleryManager({ vendor, onSubmit }: Props) {
  // Use useVendorDashboard() context
  // State: mediaItems, selectedAlbum, isDragging, uploading

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Gallery</CardTitle>
        <CardDescription>Upload images and add videos</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Album filter */}
        {/* Drag-drop zone */}
        {/* Media grid */}
      </CardContent>

      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
```

**Key Features**:
- Drag-and-drop zone (native HTML5)
- Click-to-upload with file input ref
- Album organization with Select dropdown
- Grid layout for media items (responsive)
- Add/Edit dialogs for media metadata
- Delete with confirmation
- Video URL parsing (YouTube, Vimeo)
- Image upload via Payload Media API

#### 2. Media Upload API Endpoint (30 min)
**File**: `app/api/media/route.ts`

**Purpose**: Upload images to Payload Media collection

```typescript
export async function POST(request: Request) {
  // Parse multipart form data
  // Validate image file
  // Upload to Payload Media collection
  // Return media document with URL
}
```

**Integration**: Already exists in Payload - just need to create Next.js route wrapper

#### 3. ProfileEditTabs Integration (15 min)
**File**: `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx`

**Changes**:
- Import MediaGalleryManager
- Add tab definition between 'team' and 'products':
  ```typescript
  {
    id: 'media-gallery',
    label: 'Media Gallery',
    minTier: 1,
    component: MediaGalleryManager,
    description: 'Manage images and videos',
  }
  ```

#### 4. Public Display Component (1 hour)
**File**: `components/vendors/VendorMediaGallery.tsx`

**Purpose**: Display media gallery on public vendor profile page

**Features**:
- Album-based filtering/tabs
- Lightbox for image viewing
- Video embed player
- Responsive grid layout
- Empty state when no media

#### 5. Vendor Profile Page Integration (15 min)
**File**: `app/(site)/vendors/[slug]/page.tsx` or `_components/vendor-detail-client.tsx`

**Changes**:
- Import and render VendorMediaGallery component
- Conditional display (only if mediaGallery has items)
- Position: after team section, before products

### Testing

#### Component Tests (2 hours)
**File**: `__tests__/components/dashboard/MediaGalleryManager.test.tsx`

**Test Cases**:
- Renders empty state correctly
- Handles file drag-and-drop
- Validates file types and sizes
- Uploads images via API
- Parses YouTube/Vimeo URLs
- Filters by album
- Edits media metadata
- Deletes media items
- Saves to vendor profile
- Shows tier gate for Free tier

#### Integration Tests (1 hour)
**File**: `__tests__/integration/media-gallery-workflow.test.tsx`

**Test Cases**:
- Complete workflow: upload → organize → save → display
- Multi-image upload
- Album organization
- Video embed workflow
- Public profile display
- Tier access control

---

## 🎯 Implementation Strategy

### Phase 1: Core Component (Next Session)
1. Create MediaGalleryManager with Card layout
2. Implement native drag-and-drop
3. Add file upload to Payload Media API
4. Implement album organization
5. Add basic CRUD operations

### Phase 2: Video Support
1. Add video URL input dialog
2. Implement URL parsing (YouTube, Vimeo)
3. Extract video metadata (thumbnail, duration)
4. Store video platform for embed handling

### Phase 3: Integration
1. Add tab to ProfileEditTabs
2. Create public VendorMediaGallery component
3. Integrate into vendor profile page
4. Test tier access control

### Phase 4: Polish & Testing
1. Write comprehensive component tests
2. Write integration tests
3. Add error handling and edge cases
4. Accessibility improvements
5. Performance optimization (lazy loading, thumbnails)

---

## 📚 Reference Files

### Patterns to Follow
- `components/dashboard/ExcelImportCard.tsx` - Drag-drop pattern
- `components/dashboard/BasicInfoForm.tsx` - Form management
- `components/dashboard/LocationsManagerCard.tsx` - CRUD operations
- `components/dashboard/CaseStudiesManager.tsx` - Array field management

### Utilities
- `lib/utils/file-upload.ts` - Upload file with progress
- `lib/utils/url.ts` - URL validation/sanitization
- `lib/context/VendorDashboardContext.tsx` - Dashboard state

### UI Components
- `components/ui/*` - shadcn/ui components
- Lucide React - Icon library
- sonner - Toast notifications

---

## 🚀 Quick Start (Next Session)

```bash
# Continue from where we left off
cd /home/edwin/development/ptnextjs
git checkout vendor-media-gallery
bd list --status in_progress  # Show ptnextjs-wpx

# Create MediaGalleryManager component
# Follow pattern from ExcelImportCard.tsx
# Use Card-based layout
# Native drag-drop handlers

# Test locally
npm run dev
# Navigate to vendor dashboard → Profile → Media Gallery tab
```

---

## 💡 Key Decisions Made

1. **No External Drag-Drop Library**: Use native HTML5 API for consistency
2. **Payload Media Collection**: Leverage existing upload infrastructure
3. **Album Organization**: Simple string-based categorization (no separate collection)
4. **Video Embeds Only**: No video file uploads (YouTube/Vimeo only)
5. **Tier 1+ Access**: Media gallery available to all paid tiers
6. **Grid Layout**: Responsive grid for visual browsing
7. **Separate Display Component**: Public gallery separate from manager

---

## 📊 Effort Estimates

- **MediaGalleryManager Component**: 2-3 hours
- **API Endpoint Wrapper**: 30 minutes
- **ProfileEditTabs Integration**: 15 minutes
- **Public Display Component**: 1 hour
- **Profile Page Integration**: 15 minutes
- **Component Tests**: 2 hours
- **Integration Tests**: 1 hour
- **Polish & Bug Fixes**: 1 hour

**Total**: 8-10 hours to complete feature

**Current Progress**: ~5 hours invested (setup, analysis, schema)

---

## 🐛 Known Issues / TODOs

- [ ] Need to create `/api/media` route wrapper (Payload Media already exists)
- [ ] Video thumbnail extraction (may need external service)
- [ ] Image optimization (leverage Payload's built-in resizing)
- [ ] Drag-to-reorder within albums
- [ ] Bulk upload support
- [ ] Image editing/cropping tools
- [ ] Maximum media items per tier limit enforcement

---

## Context at Pause

**Token Usage**: 109,855 / 200,000 (54.9%)
**Files Modified**: 2 (lib/types.ts, payload/collections/Vendors.ts)
**Files Created**: 1 (this progress doc)
**Branch**: vendor-media-gallery (not yet pushed)
**Beads**: ptnextjs-wpx updated with progress

**Next Step**: Create MediaGalleryManager component following ExcelImportCard pattern
