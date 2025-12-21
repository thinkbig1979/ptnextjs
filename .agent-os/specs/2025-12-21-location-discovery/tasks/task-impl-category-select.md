# Task: Implement CategorySelect Component

## Metadata
- **Task ID**: impl-category-select
- **Phase**: 3 - Frontend Components
- **Agent**: frontend-react-specialist
- **Estimated Time**: 20-25 min
- **Dependencies**: None
- **Status**: pending

## Description

Create a category dropdown filter component for the vendors page using shadcn/ui Select.

## Specifics

### File to Create
`components/vendors/CategorySelect.tsx`

### Props Interface
```typescript
interface CategorySelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

// Category type (from lib/types.ts)
interface Category {
  id: string;
  name: string;
  slug: string;
}
```

### Component Structure
```tsx
<Select value={value ?? ""} onValueChange={v => onChange(v || null)}>
  <SelectTrigger className={cn("w-full", className)}>
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">All Categories</SelectItem>
    {categories.map(cat => (
      <SelectItem key={cat.id} value={cat.slug}>
        {cat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Required Imports
- `@/components/ui/select` - SelectTrigger, SelectContent, SelectItem, SelectValue, Select
- `@/lib/utils:cn` - Class name utility

### Notes
- Empty string value represents "All Categories"
- Convert empty string to null in onChange
- Use category slug as value (for URL params)

## Acceptance Criteria

- [ ] Component exports from `components/vendors/CategorySelect.tsx`
- [ ] Shows "All Categories" as default/placeholder
- [ ] Lists all categories from props
- [ ] Calls onChange with category slug or null
- [ ] Supports className prop for styling
- [ ] Uses shadcn Select component styling
- [ ] Accessible (keyboard navigation, ARIA labels)

## Testing Requirements

### Unit Tests (`components/vendors/__tests__/CategorySelect.test.tsx`)
- Test category rendering
- Test selection change callback
- Test "All Categories" selection
- Test empty categories array

## Related Files
- `components/ui/select.tsx` - shadcn Select component
- `lib/types.ts` - Category type
- `app/(site)/components/vendors-client.tsx` - Integration target
