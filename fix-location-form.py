#!/usr/bin/env python3
"""Fix circular dependency bug in location form validation"""
import re

location_form_file = "/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx"

print("Fixing location form validation...")

with open(location_form_file, 'r') as f:
    content = f.read()

# Replace latitude validation - make it optional
old_lat = r"""      case 'latitude':
        if \(value === undefined \|\| value === null \|\| value === ''\) \{
          return 'Latitude is required';
        \}
        const lat = Number\(value\);
        if \(isNaN\(lat\) \|\| lat < -90 \|\| lat > 90\) \{
          return 'Latitude must be between -90 and 90';
        \}
        break;"""

new_lat = """      case 'latitude':
        // Only validate if a value is provided (allow undefined until geocoding)
        if (value !== undefined && value !== null && value !== '') {
          const lat = Number(value);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return 'Latitude must be between -90 and 90';
          }
        }
        break;"""

content = re.sub(old_lat, new_lat, content)

# Replace longitude validation - make it optional
old_lng = r"""      case 'longitude':
        if \(value === undefined \|\| value === null \|\| value === ''\) \{
          return 'Longitude is required';
        \}
        const lng = Number\(value\);
        if \(isNaN\(lng\) \|\| lng < -180 \|\| lng > 180\) \{
          return 'Longitude must be between -180 and 180';
        \}
        break;"""

new_lng = """      case 'longitude':
        // Only validate if a value is provided (allow undefined until geocoding)
        if (value !== undefined && value !== null && value !== '') {
          const lng = Number(value);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return 'Longitude must be between -180 and 180';
          }
        }
        break;"""

content = re.sub(old_lng, new_lng, content)

# Also update the label text to indicate coordinates are auto-filled
old_lat_label = r"              Latitude <span className=\"text-red-500\">\*</span>"
new_lat_label = r"              Latitude <span className=\"text-gray-500 text-xs\">(auto-filled by geocoding)</span>"

content = re.sub(old_lat_label, new_lat_label, content)

old_lng_label = r"              Longitude <span className=\"text-red-500\">\*</span>"
new_lng_label = r"              Longitude <span className=\"text-gray-500 text-xs\">(auto-filled by geocoding)</span>"

content = re.sub(old_lng_label, new_lng_label, content)

with open(location_form_file, 'w') as f:
    f.write(content)

print("✓ Location form validation fixed!")
print("  - Latitude and longitude are now optional during form editing")
print("  - They will be auto-populated by the geocoding button")
print("  - Labels updated to indicate auto-fill behavior")
