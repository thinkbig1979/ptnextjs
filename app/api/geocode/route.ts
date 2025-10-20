import { NextRequest, NextResponse } from 'next/server';

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

interface GeocodeMapsCoResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    // Validate input
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: 'Address is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedAddress = address.trim();

    // Call geocode.maps.co API (free geocoding service)
    const encodedAddress = encodeURIComponent(trimmedAddress);
    const geocodeResponse = await fetch(
      `https://geocode.maps.co/search?q=${encodedAddress}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!geocodeResponse.ok) {
      if (geocodeResponse.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      throw new Error(
        `Geocoding service returned status ${geocodeResponse.status}`
      );
    }

    const results: GeocodeMapsCoResponse[] = await geocodeResponse.json();

    // Check if we got any results
    if (!results || results.length === 0) {
      return NextResponse.json(
        {
          error:
            'Address not found. Please check the address and try again.',
        },
        { status: 404 }
      );
    }

    // Use the first result
    const firstResult = results[0];
    const latitude = parseFloat(firstResult.lat);
    const longitude = parseFloat(firstResult.lon);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates returned from geocoding service');
    }

    const result: GeocodingResult = {
      latitude,
      longitude,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Geocoding error:', message);
    return NextResponse.json(
      { error: 'Failed to geocode address. Please try again later.' },
      { status: 500 }
    );
  }
}
