#!/usr/bin/env python3
import re

# Test the regex pattern
test_strings = [
    "await page.goto(`${BASE_URL}/vendor/register/');",
    "await page.goto(`${BASE_URL}/vendor/login/');",
    "response => response.url().includes(`/api/vendors/${vendorId}') && response.request().method() === 'PATCH'",
]

pattern = r'`([^`]*?)\''

for test in test_strings:
    matches = re.findall(pattern, test)
    if matches:
        print(f"MATCH: {test}")
        fixed = re.sub(pattern, r'`\1`', test)
        print(f"FIXED: {fixed}")
        print()
