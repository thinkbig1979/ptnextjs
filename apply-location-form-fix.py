#!/usr/bin/env python3
"""Fix circular dependency bug in location form validation - DIRECT STRING REPLACEMENT"""

file_path = "/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx"

print("Reading location form file...")
with open(file_path, 'r') as f:
    content = f.read()

# First fix: latitude validation
old_latitude = """      case 'latitude':
        if (value === undefined || value === null || value === '') {
          return 'Latitude is required';
        }
        const lat = Number(value);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return 'Latitude must be between -90 and 90';
        }
        break;"""

new_latitude = """      case 'latitude':
        // Only validate if a value is provided (allow undefined until geocoding)
        if (value !== undefined && value !== null && value !== '') {
          const lat = Number(value);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return 'Latitude must be between -90 and 90';
          }
        }
        break;"""

if old_latitude in content:
    print("Found latitude validation case... fixing...")
    content = content.replace(old_latitude, new_latitude)
    print("✓ Latitude validation fixed")
else:
    print("ERROR: Could not find latitude validation case!")
    print("Expected to find:")
    print(old_latitude)

# Second fix: longitude validation
old_longitude = """      case 'longitude':
        if (value === undefined || value === null || value === '') {
          return 'Longitude is required';
        }
        const lng = Number(value);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return 'Longitude must be between -180 and 180';
        }
        break;"""

new_longitude = """      case 'longitude':
        // Only validate if a value is provided (allow undefined until geocoding)
        if (value !== undefined && value !== null && value !== '') {
          const lng = Number(value);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return 'Longitude must be between -180 and 180';
          }
        }
        break;"""

if old_longitude in content:
    print("Found longitude validation case... fixing...")
    content = content.replace(old_longitude, new_longitude)
    print("✓ Longitude validation fixed")
else:
    print("ERROR: Could not find longitude validation case!")

# Third fix: update latitude label
old_lat_label = """            <Label htmlFor={`latitude-${location.id || 'new'}`}>
              Latitude <span className="text-red-500">*</span>
            </Label>"""

new_lat_label = """            <Label htmlFor={`latitude-${location.id || 'new'}`}>
              Latitude <span className="text-gray-500 text-xs">(auto-filled by geocoding)</span>
            </Label>"""

if old_lat_label in content:
    print("Found latitude label... updating...")
    content = content.replace(old_lat_label, new_lat_label)
    print("✓ Latitude label updated")
else:
    print("WARNING: Could not find latitude label - it may already be updated")

# Fourth fix: update longitude label
old_lng_label = """            <Label htmlFor={`longitude-${location.id || 'new'}`}>
              Longitude <span className="text-red-500">*</span>
            </Label>"""

new_lng_label = """            <Label htmlFor={`longitude-${location.id || 'new'}`}>
              Longitude <span className="text-gray-500 text-xs">(auto-filled by geocoding)</span>
            </Label>"""

if old_lng_label in content:
    print("Found longitude label... updating...")
    content = content.replace(old_lng_label, new_lng_label)
    print("✓ Longitude label updated")
else:
    print("WARNING: Could not find longitude label - it may already be updated")

# Write the fixed content
print("\nWriting fixed file...")
with open(file_path, 'w') as f:
    f.write(content)

print("\nFix complete!")
print("Changes applied to: {}".format(file_path))
print("\nSummary of fixes:")
print("  ✓ Latitude and longitude validation changed from required to optional")
print("  ✓ Only validate coordinates if values are actually provided")
print("  ✓ Labels updated to show coordinates are auto-filled by geocoding button")
print("\nNext steps:")
print("  1. Run: npm run dev:clean")
print("  2. Run: npx playwright test tests/e2e/vendor-onboarding/07-tier2-locations.spec.ts -g '7.1' --headed")
