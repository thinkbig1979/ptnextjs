# Task: impl-pricing

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-35 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Pricing section with display text, subtitle, currency dropdown, and contact form toggle.

## Specifics

### Files to Create
- `components/dashboard/product-form/PricingSection.tsx`

### Files to Reference
- `lib/validation/product-schema.ts` - PricingSchema definition
- `sub-specs/ux-ui-spec.md` - Section 3 for visual design

### Technical Details

**Props:**
```typescript
interface PricingSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Pricing Fields:**
```typescript
// Top-level price field
price?: string;  // Max 100, simple text

// Nested pricing object
pricing?: {
  displayText?: string;      // Max 100
  subtitle?: string;         // Max 200
  currency?: string;         // Max 10
  showContactForm?: boolean; // Default true
}
```

**Features:**
1. Price display text input (e.g., "From $12,500", "Contact for Quote")
2. Pricing subtitle input (e.g., "Installed price", "Starting at")
3. Currency dropdown (USD, EUR, GBP, etc.)
4. Contact form toggle switch

**Currency Options:**
- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- CHF - Swiss Franc
- AUD - Australian Dollar
- CAD - Canadian Dollar
- Other (free text input)

## Acceptance Criteria

- [ ] Price display text input works
- [ ] Subtitle input works
- [ ] Currency dropdown shows common currencies
- [ ] Contact form toggle switch functional
- [ ] Helper text explains each field's purpose
- [ ] All fields are optional
- [ ] Proper spacing and layout

## Testing Requirements

```typescript
describe('PricingSection', () => {
  it('renders all pricing fields', () => {});
  it('accepts price display text', () => {});
  it('accepts pricing subtitle', () => {});
  it('selects currency from dropdown', () => {});
  it('toggles contact form switch', () => {});
  it('defaults showContactForm to true', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `lib/validation/product-schema.ts` - PricingSchema (lines 50-60)
- `sub-specs/ux-ui-spec.md` - Section 3 layout reference

### Pattern Constraints
- Use FormField pattern for all inputs
- Use Select component for currency
- Use Switch component for toggle
- Two-column layout for subtitle/currency on desktop

## Implementation Notes

```tsx
const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

return (
  <FormSection title="Pricing" tierRequired="tier2" icon={<DollarSign />}>
    <div className="space-y-6">
      {/* Price Display Text */}
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price Display Text</FormLabel>
            <FormControl>
              <Input placeholder='e.g., "From $12,500" or "Contact for Quote"' {...field} />
            </FormControl>
            <FormDescription>
              How the price appears on your product page
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Two-column layout for subtitle and currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="pricing.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing Subtitle</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Installed price" {...field} />
              </FormControl>
              <FormDescription>Additional context for the price</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pricing.currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Form Toggle */}
      <FormField
        control={control}
        name="pricing.showContactForm"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Show Contact Form</FormLabel>
              <FormDescription>
                Display a contact form for pricing inquiries
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </FormSection>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - PricingSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper
