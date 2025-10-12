import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authService } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyName, website, description } = body;

    // Validate required fields
    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, and company name are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    });

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user account (vendor role, pending status)
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        hash: hashedPassword,
        role: 'vendor',
        status: 'pending', // Requires admin approval
      },
    });

    // Generate slug from company name
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create vendor profile (linked to user)
    const vendor = await payload.create({
      collection: 'vendors',
      data: {
        slug,
        name: companyName,
        description: description || '',
        website: website || '',
        tier: 'free', // Default to free tier
        featured: false,
        partner: true,
        user: user.id,
        logo: '',
        image: '',
        location: '',
        services: [],
        certifications: [],
      },
    });

    return NextResponse.json({
      message: 'Registration successful. Your account is pending admin approval.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      vendor: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Vendor Registration] Error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
