import { NextResponse } from 'next/server';
import tinaCMSDataService from '@/lib/tinacms-data-service';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const yacht = await tinaCMSDataService.getYachtBySlug(params.slug);

    if (!yacht) {
      return NextResponse.json(
        { error: 'Yacht not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(yacht, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching yacht:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yacht' },
      { status: 500 }
    );
  }
}