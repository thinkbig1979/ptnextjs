'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';

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

  contactName: z
    .string()
    .max(255, { message: 'Contact name must be less than 255 characters' })
    .optional(),

  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),

  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the terms and conditions' }),
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
 * Registration form for new vendors with comprehensive validation,
 * error handling, and user feedback.
 */
export function VendorRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      contactName: '',
      phone: '',
      website: '',
      description: '',
      agreeToTerms: false,
    },
  });

  const password = form.watch('password');
  const description = form.watch('description');
  const passwordStrength = calculatePasswordStrength(password || '');

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contactEmail: data.email,
          password: data.password,
          companyName: data.companyName,
          contactName: data.contactName,
          contactPhone: data.phone,
          website: data.website,
          description: data.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 409) {
          if (result.code === 'EMAIL_EXISTS' || result.code === 'DUPLICATE_EMAIL') {
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

          if (result.code === 'COMPANY_EXISTS') {
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
            description: result.error || 'Please check your form inputs',
            variant: 'destructive',
          });
          return;
        }

        if (response.status === 500) {
          toast({
            title: 'Server Error',
            description: result.error || 'Internal server error',
            variant: 'destructive',
          });
          return;
        }

        // Generic error
        throw new Error(result.error || 'Registration failed');
      }

      // Success
      toast({
        title: 'Registration Successful',
        description: 'Your account is pending approval',
      });

      // Clear form
      form.reset();

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
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Email">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="vendor@example.com"
                  aria-label="Email"
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Company Name Field */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Company Name">Company Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Your Company Ltd"
                  aria-label="Company Name"
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Contact Name Field */}
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Contact Name">Contact Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="John Smith"
                  aria-label="Contact Name"
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Phone">Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  aria-label="Phone"
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Website Field */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Website">Website</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  aria-label="Website"
                  {...field}
                />
              </FormControl>
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
              <FormLabel aria-label="Password">
                Password
                <button
                  type="button"
                  data-testid="password-help-icon"
                  className="ml-2 inline-flex items-center"
                  title="Password must contain at least 12 characters, including uppercase, lowercase, number, and special character"
                >
                  <Info className="h-4 w-4 text-gray-400" />
                </button>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter strong password"
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
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
              <FormLabel aria-label="Confirm Password">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Description">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your company..."
                  aria-label="Description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {description?.length || 0} / 500
              </FormDescription>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Terms and Conditions Checkbox */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Agree to terms and conditions"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel aria-label="Agree to terms and conditions">
                  I agree to the terms and conditions
                </FormLabel>
                <FormMessage role="alert" />
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
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
