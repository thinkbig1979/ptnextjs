# Task: impl-array-reordering

## Metadata
- **Phase**: 2 - Frontend Implementation (Enhancement)
- **Agent**: frontend-react-specialist
- **Estimated Time**: 40-50 min
- **Dependencies**: impl-images, impl-specifications, impl-features
- **Status**: pending

## Description

Add drag-and-drop reordering capability to array field sections (Images, Specifications, Features) as required by FR-1.5, FR-3.3, and FR-4.3 in the spec.

## Specifics

### Files to Modify
- `components/dashboard/product-form/ImagesSection.tsx`
- `components/dashboard/product-form/SpecificationsSection.tsx`
- `components/dashboard/product-form/FeaturesSection.tsx`

### Libraries to Use
- `@dnd-kit/core` + `@dnd-kit/sortable` (recommended - works well with React)
- OR `react-beautiful-dnd` (Atlassian library)
- OR simple up/down buttons (minimal approach)

### Technical Details

**Functional Requirements:**
- FR-1.5: Reorder images (drag-and-drop or up/down buttons)
- FR-3.3: Reorder specifications
- FR-4.3: Reorder features by drag or explicit order number

**Implementation Options:**

**Option A: @dnd-kit (Recommended)**
- Modern, accessible, works with React 18
- Good touch support for mobile
- Integrates well with useFieldArray

**Option B: Up/Down Buttons (Minimal)**
- No additional dependencies
- Less intuitive but simpler
- Works better on mobile without drag

**Implementation Approach:**
1. Wrap array items in sortable container
2. Add drag handle to each item
3. On drag end, update the array order via `move()` from useFieldArray
4. Update `order` field for each item (if applicable)

## Acceptance Criteria

- [ ] Images can be reordered via drag-and-drop or buttons
- [ ] Specifications can be reordered
- [ ] Features can be reordered
- [ ] Order persists when form is saved
- [ ] Drag handles are accessible (keyboard support)
- [ ] Mobile: Touch drag works OR up/down buttons available
- [ ] Visual feedback during drag (ghost element, drop zone highlight)

## Testing Requirements

```typescript
describe('Array Reordering', () => {
  describe('ImagesSection', () => {
    it('reorders images via drag and drop', async () => {
      // Add 3 images, drag first to last position
      // Verify order changed
    });

    it('maintains order after form save', async () => {
      // Reorder, save, reload, verify order
    });
  });

  describe('SpecificationsSection', () => {
    it('reorders specifications', () => {});
  });

  describe('FeaturesSection', () => {
    it('reorders features', () => {});
  });
});
```

## Context Requirements

### Must Read Before Implementation
- `spec.md` - FR-1.5, FR-3.3, FR-4.3 requirements
- @dnd-kit documentation: https://dndkit.com/

## Implementation Notes

```tsx
// Using @dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Sortable item wrapper
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        className="mt-2 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// In ImagesSection
function ImagesSection({ control }: ImagesSectionProps) {
  const { fields, move } = useFieldArray({ control, name: 'images' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        {fields.map((field, index) => (
          <SortableItem key={field.id} id={field.id}>
            {/* Image card content */}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

// Alternative: Up/Down buttons (no dependencies)
function ArrayItemWithButtons({
  index,
  total,
  onMoveUp,
  onMoveDown,
  children,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

**Package Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Related Files
- `components/dashboard/product-form/ImagesSection.tsx`
- `components/dashboard/product-form/SpecificationsSection.tsx`
- `components/dashboard/product-form/FeaturesSection.tsx`
- `package.json` - Add @dnd-kit dependencies
