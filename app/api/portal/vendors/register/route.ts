import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/utils/get-payload-config";
import { authService } from "@/lib/services/auth-service";
import { z } from "zod";
import {
  verifyHCaptchaToken,
  getHCaptchaErrorMessage,
} from "@/lib/utils/hcaptcha";
import { rateLimit } from "@/lib/middleware/rateLimit";

// Rate limit: 6 attempts per hour per IP
const REGISTER_RATE_LIMIT = {
  maxRequests: 6,
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

function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateRegistrationInput(
  body: unknown,
): { data: VendorRegistrationRequest } | { error: NextResponse } {
  const validationResult = vendorRegistrationSchema.safeParse(body);

  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {};
    validationResult.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });

    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            fields: fieldErrors,
          },
        },
        { status: 400 },
      ),
    };
  }

  const data = validationResult.data;

  try {
    authService.validatePasswordStrength(data.password);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid password";
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: msg,
            fields: { password: msg },
          },
        },
        { status: 400 },
      ),
    };
  }

  return { data };
}

async function verifyCaptcha(
  token: string | undefined,
): Promise<NextResponse | null> {
  const captchaDisabled = process.env.DISABLE_CAPTCHA === "true";
  if (!process.env.HCAPTCHA_SECRET_KEY || captchaDisabled) {
    return null;
  }

  if (!token) {
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

  const captchaResult = await verifyHCaptchaToken(token);

  if (!captchaResult.success) {
    const errorMessage = getHCaptchaErrorMessage(
      captchaResult["error-codes"],
    );
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

  return null;
}

async function checkDuplicates(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  email: string,
  companyName: string,
): Promise<NextResponse | null> {
  const existingUsers = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existingUsers.docs.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DUPLICATE_EMAIL",
          message: "A user with this email already exists",
          fields: { contactEmail: "Email already registered" },
        },
      },
      { status: 409 },
    );
  }

  const existingVendors = await payload.find({
    collection: "vendors",
    where: { companyName: { equals: companyName } },
    limit: 1,
  });

  if (existingVendors.docs.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COMPANY_EXISTS",
          message: "A company with this name already exists",
          fields: { companyName: "Company name already exists" },
        },
      },
      { status: 409 },
    );
  }

  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(
    request,
    async () => {
      try {
        const body = await request.json();

        const validation = validateRegistrationInput(body);
        if ("error" in validation) return validation.error;
        const data = validation.data;

        const captchaError = await verifyCaptcha(data.captchaToken);
        if (captchaError) return captchaError;

        const payload = await getPayloadClient();

        const duplicateError = await checkDuplicates(
          payload,
          data.contactEmail,
          data.companyName,
        );
        if (duplicateError) return duplicateError;

        const slug = generateSlug(data.companyName);
        let userId: string | number | undefined;
        let vendorId: string | number | undefined;

        try {
          const user = await payload.create({
            collection: "users",
            data: {
              email: data.contactEmail,
              password: data.password,
              role: "vendor",
              status: "pending",
            },
            overrideAccess: true,
          });
          userId = user.id;

          const vendor = await payload.create({
            collection: "vendors",
            data: {
              user: Number(userId),
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
          if (userId && !vendorId) {
            try {
              await payload.delete({
                collection: "users",
                id: userId,
                overrideAccess: true,
              });
            } catch (rollbackError) {
              console.error(
                "[VendorRegistration] Failed to rollback user creation:",
                rollbackError,
              );
            }
          }
          throw error;
        }
      } catch (error) {
        console.error("[VendorRegistration] Registration failed:", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

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
