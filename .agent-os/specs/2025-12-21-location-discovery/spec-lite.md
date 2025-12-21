# Spec Summary (Lite)

Add smart vendor-product-location matching to help users discover nearby vendors. Two features: (1) "Vendors Near You" section on product detail pages showing vendors who sell that product category within user's radius, and (2) Enhanced vendor search page with combined location + category filtering to answer "find vendors near Monaco that sell Navigation Systems". Uses existing geolocation infrastructure (Haversine distance, LocationSearchFilter, useLocationFilter hook) with localStorage for remembering user's preferred location.
