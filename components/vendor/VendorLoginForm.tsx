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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

/**
 * Zod validation schema for vendor login form
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),

  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * VendorLoginForm Component
 *
 * Login form for vendor authentication with error handling for
 * invalid credentials, pending accounts, and rejected accounts.
 */
export function VendorLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);

      // Call AuthContext login method
      await login(data.email, data.password);

      // Success - redirect to vendor dashboard
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });

      router.push('/vendor/dashboard');
    } catch (error) {
      // Extract error message
      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      // Display appropriate error based on error message
      if (errorMessage.includes('Invalid email or password')) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('pending approval') || errorMessage.includes('awaiting admin approval')) {
        toast({
          title: 'Account Pending',
          description: 'Your account is awaiting admin approval',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('rejected') || errorMessage.includes('has been rejected')) {
        toast({
          title: 'Account Rejected',
          description: 'Your account has been rejected. Contact support.',
          variant: 'destructive',
        });
      } else {
        // Generic error
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
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

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel aria-label="Password">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          aria-label="Login"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>

        {/* Register Link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            href="/vendor/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register here
          </Link>
        </div>
      </form>
    </Form>
  );
}
