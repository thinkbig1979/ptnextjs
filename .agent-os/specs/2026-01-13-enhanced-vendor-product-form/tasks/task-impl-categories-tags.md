# Task: impl-categories-tags

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-55 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Categories & Tags section with multi-select comboboxes that fetch data from API endpoints. Selected items display as removable badges.

## Specifics

### Files to Create
- `components/dashboard/product-form/CategoriesTagsSection.tsx`
- `hooks/useProductFormData.ts` - Fetch categories and tags

### Files to Reference
- `tests/unit/components/CategorySelect.test.tsx` - Similar component test patterns
- `app/api/categories/route.ts` - Existing categories API (if exists)
- `sub-specs/ux-ui-spec.md` - Section 6 for visual design

### Technical Details

**Props:**
```typescript
interface CategoriesTagsSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Data Structure:**
```typescript
// Form values
categories: string[];  // Array of category IDs
tags: string[];        // Array of tag IDs

// API response
interface Category { id: string; name: string; slug: string; }
interface Tag { id: string; name: string; slug: string; }
```

**Hook to Create:**
```typescript
// hooks/useProductFormData.ts
export function useProductFormData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [catsRes, tagsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags'),
      ]);
      // ... handle responses
    }
    fetchData();
  }, []);

  return { categories, tags, isLoading, error };
}
```

**Features:**
1. Fetch categories and tags on component mount
2. Multi-select combobox with search/filter
3. Selected items display as removable badges
4. Loading skeleton while fetching
5. Error state with retry button

## Acceptance Criteria

- [ ] Categories load from API on mount
- [ ] Tags load from API on mount
- [ ] Multi-select combobox allows selecting multiple items
- [ ] Search/filter functionality filters options
- [ ] Selected items display as badges below input
- [ ] Clicking badge "x" removes selection
- [ ] Loading state shows skeleton
- [ ] Error state shows retry option
- [ ] Keyboard accessible (arrow keys, enter, escape)

## Testing Requirements

```typescript
describe('CategoriesTagsSection', () => {
  it('loads categories from API', async () => {});
  it('loads tags from API', async () => {});
  it('shows loading state initially', () => {});
  it('allows selecting multiple categories', () => {});
  it('displays selected as badges', () => {});
  it('removes selection on badge click', () => {});
  it('filters options on search', () => {});
  it('handles API error gracefully', () => {});
});

describe('useProductFormData', () => {
  it('fetches categories', async () => {});
  it('fetches tags', async () => {});
  it('handles loading state', () => {});
  it('handles API errors', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `tests/unit/components/CategorySelect.test.tsx` - Full file for patterns
- `sub-specs/ux-ui-spec.md` - Section 6 layout reference

### API Routes (create if needed)
- `GET /api/categories` - Returns `{ docs: Category[] }`
- `GET /api/tags` - Returns `{ docs: Tag[] }`

## Implementation Notes

```tsx
// Multi-select combobox using shadcn Command + Popover
const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
}: {
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.name}
                onSelect={() => {
                  const newValue = selected.includes(option.id)
                    ? selected.filter((id) => id !== option.id)
                    : [...selected, option.id];
                  onChange(newValue);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Selected badges display
const SelectedBadges = ({
  selected,
  options,
  onRemove,
}: {
  selected: string[];
  options: { id: string; name: string }[];
  onRemove: (id: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {selected.map((id) => {
      const option = options.find((o) => o.id === id);
      return option ? (
        <Badge key={id} variant="secondary" className="gap-1">
          {option.name}
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="ml-1 rounded-full hover:bg-muted"
            aria-label={`Remove ${option.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ) : null;
    })}
  </div>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - Form schema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper
- `app/api/categories/route.ts` - API endpoint
- `app/api/tags/route.ts` - API endpoint
