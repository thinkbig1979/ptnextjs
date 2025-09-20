import { NextResponse } from 'next/server';
import tinaCMSDataService from '@/lib/tinacms-data-service';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const yachts = await tinaCMSDataService.getYachts();

    return NextResponse.json(yachts, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching yachts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    );
  }
}