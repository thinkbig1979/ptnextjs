---
name: "Invalid Product with Non-Existent Vendor"
slug: "invalid-product-no-vendor"
description: "This product references a vendor that doesn't exist"
vendor: "content/vendors/non-existent-vendor.md"
product_images:
  - image: "/media/products/invalid-product.jpg"
    alt_text: "Invalid Product Image"
    is_main: true
published: false
---

This is an invalid product markdown file used for testing error handling.
It references a vendor that doesn't exist in the system, which should cause the migration to fail gracefully.
