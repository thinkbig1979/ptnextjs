# Task: impl-images

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Images section with URL input, thumbnail previews, main image selection, alt text, captions, and array management using React Hook Form's useFieldArray.

## Specifics

### Files to Create
- `components/dashboard/product-form/ImagesSection.tsx`

### Files to Reference
- `lib/validation/product-schema.ts` - ProductImageSchema definition
- `components/ui/card.tsx` - Card layout for image items

### Technical Details

**Props:**
```typescript
interface ImagesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
  tierRequired?: string;
}
```

**Image Object Shape:**
```typescript
{
  url: string;        // Required, valid URL
  altText?: string;   // Optional, max 255
  isMain?: boolean;   // One image per product
  caption?: string;   // Optional, max 255
}
```

**Features:**
1. URL input with Add button
2. URL validation on blur (format check + image load test)
3. Thumbnail preview (64x64) on valid URL
4. Radio group for isMain selection (only one can be main)
5. Alt text and caption inputs per image
6. Remove button with undo toast
7. Empty state message

**Validation:**
- URL must be valid format
- Async image load check (optional, timeout 5s)
- Show broken image icon if load fails

## Acceptance Criteria

- [ ] Can add image via URL input and Add button
- [ ] URL validation shows error for invalid format
- [ ] Thumbnail preview displays for valid image URLs
- [ ] Main image selection works (radio button, only one active)
- [ ] Can edit alt text and caption for each image
- [ ] Remove button shows confirmation (undo toast)
- [ ] Empty state shows "No images added" message
- [ ] Disabled state prevents all interactions
- [ ] Focus moves to first field when section expands

## Testing Requirements

```typescript
describe('ImagesSection', () => {
  it('renders empty state initially', () => {});
  it('adds image when valid URL entered', () => {});
  it('shows validation error for invalid URL', () => {});
  it('displays thumbnail preview for valid URL', () => {});
  it('allows setting main image (only one)', () => {});
  it('edits alt text and caption', () => {});
  it('removes image with undo option', () => {});
  it('handles disabled state', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `lib/validation/product-schema.ts` - ProductImageSchema (lines 1-20)
- `components/ui/card.tsx` - Full file for layout pattern

### Pattern Constraints
- Use `useFieldArray` from react-hook-form
- Use shadcn Card for image items
- Use RadioGroup for isMain selection
- Use toast for remove undo

## Implementation Notes

```tsx
// useFieldArray setup
const { fields, append, remove, update } = useFieldArray({
  control,
  name: 'images',
});

// Add image handler
const handleAddImage = () => {
  const url = newImageUrl.trim();
  if (!url) return;

  // Validate URL format
  try {
    new URL(url);
  } catch {
    setUrlError('Please enter a valid URL');
    return;
  }

  append({
    url,
    altText: '',
    isMain: fields.length === 0, // First image is main by default
    caption: '',
  });
  setNewImageUrl('');
};

// Main image selection (ensure only one)
const handleMainImageChange = (index: number) => {
  fields.forEach((field, i) => {
    if (i === index) {
      update(i, { ...field, isMain: true });
    } else if (field.isMain) {
      update(i, { ...field, isMain: false });
    }
  });
};

// Remove with undo
const handleRemove = (index: number) => {
  const removedImage = fields[index];
  remove(index);

  toast({
    title: 'Image removed',
    description: 'Click undo to restore',
    action: (
      <ToastAction altText="Undo" onClick={() => append(removedImage)}>
        Undo
      </ToastAction>
    ),
  });
};

// Image preview with error handling
const ImagePreview = ({ url }: { url: string }) => {
  const [error, setError] = useState(false);

  return error ? (
    <ImageOff className="h-16 w-16 text-muted-foreground" />
  ) : (
    <img
      src={url}
      alt=""
      className="h-16 w-16 object-cover rounded"
      onError={() => setError(true)}
    />
  );
};
```

## Related Files
- `components/dashboard/product-form/types.ts` - ExtendedProductFormValues
- `components/dashboard/product-form/FormSection.tsx` - Wrapper component
