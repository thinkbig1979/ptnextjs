'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { HelpTooltip } from '@/components/help';

// Dynamically import HCaptcha to avoid SSR issues
const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), {
  ssr: false,
});

/**
 * Password strength validation regex
 */
const PASSWORD_REGEX = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

/**
 * Zod validation schema for vendor registration form
 * Simplified to only collect essential fields during initial registration
 */
const registrationSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' })
    .max(255, { message: 'Email must be less than 255 characters' }),

  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(12, { message: 'Password must be at least 12 characters' })
    .regex(PASSWORD_REGEX.hasUpperCase, { message: 'Password must contain at least one uppercase letter' })
    .regex(PASSWORD_REGEX.hasLowerCase, { message: 'Password must contain at least one lowercase letter' })
    .regex(PASSWORD_REGEX.hasNumber, { message: 'Password must contain at least one number' })
    .regex(PASSWORD_REGEX.hasSpecialChar, { message: 'Password must contain at least one special character' }),

  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' }),

  companyName: z
    .string()
    .min(1, { message: 'Company name is required' })
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name must be less than 100 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password: string): 'Weak' | 'Medium' | 'Strong' {
  if (!password || password.length < 8) return 'Weak';

  let strength = 0;

  if (password.length >= 12) strength++;
  if (PASSWORD_REGEX.hasUpperCase.test(password)) strength++;
  if (PASSWORD_REGEX.hasLowerCase.test(password)) strength++;
  if (PASSWORD_REGEX.hasNumber.test(password)) strength++;
  if (PASSWORD_REGEX.hasSpecialChar.test(password)) strength++;

  if (strength <= 2) return 'Weak';
  if (strength <= 4) return 'Medium';
  return 'Strong';
}

/**
 * VendorRegistrationForm Component
 *
 * Simplified registration form for new vendors that collects only essential fields:
 * - Company Name (required)
 * - Contact Email (required)
 * - Password (required)
 * - Confirm Password (required)
 *
 * Full profile details (website, description, contact info, etc.) will be collected later
 * during profile setup or vendor dashboard onboarding.
 */
export function VendorRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  /**
   * Handle successful captcha verification
   */
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  /**
   * Handle captcha expiration
   */
  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  /**
   * Handle captcha error
   */
  const handleCaptchaError = () => {
    setCaptchaToken(null);
  };

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
    },
  });

  const password = form.watch('password');
  const passwordStrength = calculatePasswordStrength(password || '');
  const captchaRequired = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && process.env.NEXT_PUBLIC_DISABLE_CAPTCHA !== 'true';

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegistrationFormData) => {
    // Check hCaptcha if configured (skip in test mode)
    if (captchaRequired && !captchaToken) {
      toast({
        title: 'Verification Required',
        description: 'Please complete the captcha challenge',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/portal/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contactEmail: data.email,
          password: data.password,
          companyName: data.companyName,
          captchaToken: captchaToken || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 409) {
          if (result.error?.code === 'DUPLICATE_EMAIL') {
            form.setError('email', {
              type: 'manual',
              message: 'Email already exists'
            });
            toast({
              title: 'Registration Failed',
              description: 'Email already exists',
              variant: 'destructive',
            });
            return;
          }

          if (result.error?.code === 'COMPANY_EXISTS') {
            form.setError('companyName', {
              type: 'manual',
              message: 'Company name already exists'
            });
            toast({
              title: 'Registration Failed',
              description: 'Company name already exists',
              variant: 'destructive',
            });
            return;
          }
        }

        if (response.status === 400) {
          // Validation errors from backend
          toast({
            title: 'Validation Error',
            description: result.error?.message || 'Please check your form inputs',
            variant: 'destructive',
          });
          return;
        }

        if (response.status === 500) {
          toast({
            title: 'Server Error',
            description: result.error?.message || 'Internal server error',
            variant: 'destructive',
          });
          return;
        }

        // Generic error
        throw new Error(result.error?.message || 'Registration failed');
      }

      // Success
      toast({
        title: 'Registration Successful',
        description: 'Your account is pending approval',
      });

      // Clear form and captcha
      form.reset();
      setCaptchaToken(null);

      // Redirect to pending page
      router.push('/vendor/registration-pending');
    } catch (error) {
      // Network or unexpected errors
      console.error('Registration error:', error);

      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the server',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name Field */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Company Name" className="flex items-center gap-1">
                Company Name
                <HelpTooltip
                  content="Your official business name as it will appear on your profile."
                  title="Company Name"
                  data-testid="company-name-help-icon"
                />
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Acme Marine Services Ltd"
                  aria-label="Company Name"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                2-100 characters. This will be displayed publicly.
              </FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Email" className="flex items-center gap-1">
                Email
                <HelpTooltip
                  content="Business email for account login and notifications."
                  title="Email"
                  data-testid="email-help-icon"
                />
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@yourcompany.com"
                  aria-label="Email"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We will send account notifications to this address.
              </FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Password" className="flex items-center gap-1">
                Password
                <HelpTooltip
                  content="12+ characters with uppercase, lowercase, number, and special character."
                  title="Password Requirements"
                  data-testid="password-help-icon"
                />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    aria-label="Password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </FormControl>
              {password && (
                <FormDescription>
                  Password Strength: <span className={`font-semibold ${
                    passwordStrength === 'Weak' ? 'text-red-500' :
                    passwordStrength === 'Medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength}
                  </span>
                </FormDescription>
              )}
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Confirm Password" className="flex items-center gap-1">
                Confirm Password
                <HelpTooltip
                  content="Re-enter your password to confirm."
                  title="Confirm Password"
                  data-testid="confirm-password-help-icon"
                />
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    aria-label="Confirm Password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormDescription>
                Must match the password above.
              </FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* hCaptcha - Always use light theme for consistency across light/dark modes */}
        {/* Skip captcha in test mode (NEXT_PUBLIC_DISABLE_CAPTCHA=true) */}
        {captchaRequired && (
          <div className="space-y-2">
            <div className="flex justify-center" data-testid="hcaptcha-container">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                theme="light"
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                onError={handleCaptchaError}
              />
            </div>
            {captchaToken ? (
              <p className="text-center text-sm text-green-600">Verification complete</p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">Please complete the verification above to continue</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || (captchaRequired && !captchaToken)}
          aria-label="Register"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </Button>
      </form>
    </Form>
  );
}
