import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { authService } from "@/lib/services/auth-service";
import { z } from "zod";
import {
  verifyHCaptchaToken,
  getHCaptchaErrorMessage,
} from "@/lib/utils/hcaptcha";
import { rateLimit } from "@/lib/middleware/rateLimit";

// Rate limit: 3 attempts per hour per IP (strict for registration)
const REGISTER_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  identifier: "/api/portal/vendors/register",
};

// Validation schema
const vendorRegistrationSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters"),
  contactEmail: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters"),
  contactName: z
    .string()
    .max(255, "Contact name must not exceed 255 characters")
    .optional(),
  contactPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Invalid phone number format",
    ),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  password: z.string().min(12, "Password must be at least 12 characters"),
  captchaToken: z.string().optional(),
});

type VendorRegistrationRequest = z.infer<typeof vendorRegistrationSchema>;

interface SuccessResponse {
  success: true;
  data: {
    vendorId: string;
    status: "pending";
    message: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code:
      | "VALIDATION_ERROR"
      | "DUPLICATE_EMAIL"
      | "COMPANY_EXISTS"
      | "CAPTCHA_FAILED"
      | "SERVER_ERROR";
    message: string;
    fields?: Record<string, string>;
  };
}

/**
 * Generate URL-friendly slug from company name
 */
function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * POST /api/vendors/register
 *
 * Register new vendor with admin approval workflow
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(
    request,
    async () => {
      try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validationResult = vendorRegistrationSchema.safeParse(body);

        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.errors.forEach((error) => {
            const field = error.path[0] as string;
            fieldErrors[field] = error.message;
          });

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                fields: fieldErrors,
              },
            },
            { status: 400 },
          );
        }

        const data: VendorRegistrationRequest = validationResult.data;

        // Additional password strength validation (delegated to AuthService)
        // Note: We only validate here, not hash. Payload CMS will hash the password when creating the user.
        try {
          authService.validatePasswordStrength(data.password);
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message:
                  error instanceof Error ? error.message : "Invalid password",
                fields: {
                  password:
                    error instanceof Error ? error.message : "Invalid password",
                },
              },
            },
            { status: 400 },
          );
        }

        // Verify hCaptcha if configured
        if (process.env.HCAPTCHA_SECRET_KEY) {
          if (!data.captchaToken) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: "CAPTCHA_FAILED",
                  message: "Please complete the captcha challenge",
                },
              },
              { status: 400 },
            );
          }

          const captchaResult = await verifyHCaptchaToken(data.captchaToken);

          if (!captchaResult.success) {
            const errorMessage = getHCaptchaErrorMessage(
              captchaResult["error-codes"],
            );
            console.log("[VendorRegistration] Captcha verification failed:", {
              errors: captchaResult["error-codes"],
              timestamp: new Date().toISOString(),
            });

            return NextResponse.json(
              {
                success: false,
                error: {
                  code: "CAPTCHA_FAILED",
                  message: errorMessage,
                },
              },
              { status: 400 },
            );
          }
        }

        // Get Payload instance
        const payload = await getPayload({ config });

        // Check for duplicate email
        const existingUsers = await payload.find({
          collection: "users",
          where: {
            email: {
              equals: data.contactEmail,
            },
          },
          limit: 1,
        });

        if (existingUsers.docs.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "DUPLICATE_EMAIL",
                message: "A user with this email already exists",
                fields: {
                  contactEmail: "Email already registered",
                },
              },
            },
            { status: 409 },
          );
        }

        // Check for duplicate company name
        const existingVendors = await payload.find({
          collection: "vendors",
          where: {
            companyName: {
              equals: data.companyName,
            },
          },
          limit: 1,
        });

        if (existingVendors.docs.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "COMPANY_EXISTS",
                message: "A company with this name already exists",
                fields: {
                  companyName: "Company name already exists",
                },
              },
            },
            { status: 409 },
          );
        }

        // Generate slug
        const slug = generateSlug(data.companyName);

        // Create user and vendor in a transaction-like manner
        // Note: Payload CMS doesn't have native transactions, but we handle errors to maintain consistency
        let userId: string | number | undefined;
        let vendorId: string | number | undefined;

        try {
          // Create user record
          // Note: overrideAccess is needed since this is a public registration endpoint
          const user = await payload.create({
            collection: "users",
            data: {
              email: data.contactEmail,
              password: data.password, // Payload will hash this automatically
              role: "vendor",
              status: "pending",
            },
            overrideAccess: true,
          });

          userId = user.id;

          // Create vendor record
          // Note: overrideAccess is needed since this is a public registration endpoint
          // and the Vendors collection has create: isAdmin access control
          const vendor = await payload.create({
            collection: "vendors",
            data: {
              user: userId,
              companyName: data.companyName,
              slug,
              contactEmail: data.contactEmail,
              contactName: data.contactName || "",
              contactPhone: data.contactPhone || "",
              website: data.website || "",
              description: data.description || "",
              tier: "free",
              published: false,
              featured: false,
            },
            overrideAccess: true,
          });

          vendorId = vendor.id;

          // Log successful registration
          console.log("[VendorRegistration] New vendor registered:", {
            vendorId: vendorId.toString(),
            userId: userId.toString(),
            companyName: data.companyName,
            email: data.contactEmail,
            timestamp: new Date().toISOString(),
          });

          // Return success response
          return NextResponse.json(
            {
              success: true,
              data: {
                vendorId: vendorId.toString(),
                status: "pending",
                message: "Registration submitted for admin approval",
              },
            },
            { status: 201 },
          );
        } catch (error) {
          // Rollback: If vendor creation failed but user was created, delete the user
          if (userId && !vendorId) {
            try {
              await payload.delete({
                collection: "users",
                id: userId,
                overrideAccess: true,
              });
              console.log(
                "[VendorRegistration] Rolled back user creation:",
                userId,
              );
            } catch (rollbackError) {
              console.error(
                "[VendorRegistration] Failed to rollback user creation:",
                rollbackError,
              );
            }
          }

          throw error; // Re-throw to be caught by outer catch block
        }
      } catch (error) {
        // Log error for monitoring
        console.error("[VendorRegistration] Registration failed:", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

        // Return generic error response
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SERVER_ERROR",
              message:
                "An error occurred during registration. Please try again.",
            },
          },
          { status: 500 },
        );
      }
    },
    REGISTER_RATE_LIMIT,
  );
}
