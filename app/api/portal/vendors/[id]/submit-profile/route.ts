import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  sendProfileSubmittedAdminEmail,
  sendProfileSubmittedVendorEmail,
} from '@/lib/services/EmailService';

interface SubmitProfileSuccessResponse {
  success: true;
  data: {
    vendorId: string;
    profileSubmitted: boolean;
    message: string;
  };
}

interface SubmitProfileErrorResponse {
  success: false;
  error: {
    code:
      | 'UNAUTHORIZED'
      | 'VENDOR_NOT_FOUND'
      | 'ALREADY_SUBMITTED'
      | 'VALIDATION_ERROR'
      | 'SERVER_ERROR';
    message: string;
    missingFields?: string[];
  };
}

/**
 * Validate that mandatory fields are filled before profile submission
 */
function validateMandatoryFields(vendor: any): {
  valid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  // Check mandatory fields for profile submission
  if (!vendor.description || vendor.description.trim() === '') {
    missingFields.push('description');
  }

  if (!vendor.logo) {
    missingFields.push('logo');
  }

  if (!vendor.contactPhone || vendor.contactPhone.trim() === '') {
    missingFields.push('contactPhone');
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * POST /api/portal/vendors/[id]/submit-profile
 *
 * Submit vendor profile for review.
 * Sets profileSubmitted=true and sends notification emails to admin and vendor.
 *
 * Requirements:
 * - User must be authenticated and own the vendor
 * - Vendor must have mandatory fields filled (description, logo, contactPhone)
 * - Profile must not already be submitted
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SubmitProfileSuccessResponse | SubmitProfileErrorResponse>> {
  try {
    const { id: vendorId } = await params;
    const payload = await getPayload({ config });

    // Get the current user from cookies/session
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to submit your profile',
          },
        },
        { status: 401 }
      );
    }

    // Fetch the vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found',
          },
        },
        { status: 404 }
      );
    }

    // Check if user owns this vendor
    const vendorUserId =
      typeof vendor.user === 'object' ? vendor.user.id : vendor.user;

    if (vendorUserId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You do not have permission to submit this profile',
          },
        },
        { status: 403 }
      );
    }

    // Check if profile is already submitted
    if (vendor.profileSubmitted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_SUBMITTED',
            message: 'Profile has already been submitted for review',
          },
        },
        { status: 400 }
      );
    }

    // Validate mandatory fields
    const validation = validateMandatoryFields(vendor);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please complete all required fields before submitting',
            missingFields: validation.missingFields,
          },
        },
        { status: 400 }
      );
    }

    // Update vendor to mark profile as submitted
    await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: {
        profileSubmitted: true,
      },
    });

    // Send notification emails (best effort - don't fail if emails fail)
    const emailData = {
      companyName: vendor.companyName,
      contactEmail: vendor.contactEmail,
      vendorId: vendorId.toString(),
    };

    try {
      // Send email to admin
      await sendProfileSubmittedAdminEmail(emailData);
      console.log('[ProfileSubmission] Admin notification sent');
    } catch (emailError) {
      console.error(
        '[ProfileSubmission] Failed to send admin email:',
        emailError
      );
    }

    try {
      // Send confirmation email to vendor
      await sendProfileSubmittedVendorEmail(emailData);
      console.log('[ProfileSubmission] Vendor confirmation sent');
    } catch (emailError) {
      console.error(
        '[ProfileSubmission] Failed to send vendor email:',
        emailError
      );
    }

    // Log successful submission
    console.log('[ProfileSubmission] Profile submitted:', {
      vendorId,
      companyName: vendor.companyName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          vendorId: vendorId.toString(),
          profileSubmitted: true,
          message: 'Your profile has been submitted for review',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ProfileSubmission] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while submitting your profile',
        },
      },
      { status: 500 }
    );
  }
}
