'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TokenStatus = 'loading' | 'valid' | 'invalid';

interface ClaimTokenData {
  companyName: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Password regex (mirrors VendorRegistrationForm rules)
// ---------------------------------------------------------------------------

const PASSWORD_REGEX = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

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

// ---------------------------------------------------------------------------
// ClaimForm — inline client component
// ---------------------------------------------------------------------------

function ClaimForm({ token }: { token: string }) {
  const router = useRouter();

  // Token validation state
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [tokenError, setTokenError] = useState<string>('');
  const [claimData, setClaimData] = useState<ClaimTokenData | null>(null);

  // Form field state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setTokenError('No invitation token provided. Check the link in your invitation email.');
      return;
    }

    const controller = new AbortController();

    fetch(`/api/portal/vendors/claim?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setClaimData({ companyName: data.companyName, email: data.email });
          setTokenStatus('valid');
        } else {
          setTokenStatus('invalid');
          setTokenError(data.error || 'This invitation link is invalid or has expired.');
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setTokenStatus('invalid');
          setTokenError('Unable to validate the invitation link. Please try again later.');
        }
      });

    return () => controller.abort();
  }, [token]);

  function validateFields(): boolean {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 12) {
      errors.password = 'Password must be at least 12 characters';
    } else if (!PASSWORD_REGEX.hasUpperCase.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!PASSWORD_REGEX.hasLowerCase.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!PASSWORD_REGEX.hasNumber.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!PASSWORD_REGEX.hasSpecialChar.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');

    if (!validateFields()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/portal/vendors/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || 'Something went wrong. Please try again.');
        return;
      }

      router.push('/vendor/login?claimed=true');
    } catch {
      setSubmitError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordStrength = calculatePasswordStrength(password);

  return tokenStatus === 'loading' ? (
    <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">Validating your invitation link...</p>
    </div>
  ) : tokenStatus === 'invalid' ? (
    <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
      <p className="font-medium">Invalid invitation link</p>
      <p className="mt-1">{tokenError}</p>
      <p className="mt-3 text-muted-foreground">
        If you believe this is an error, contact the platform administrator or request a new
        invitation.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Company Name (read-only) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none" htmlFor="companyName">
          Company Name
        </label>
        <Input
          id="companyName"
          type="text"
          value={claimData?.companyName ?? ''}
          readOnly
          aria-readonly="true"
          className="bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          This is the company name associated with your invitation.
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={claimData?.email ?? ''}
          readOnly
          aria-readonly="true"
          className="bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">You will use this address to log in.</p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            aria-label="Password"
            aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
            aria-invalid={!!fieldErrors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
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
        {password ? (
          <p id="password-hint" className="text-xs text-muted-foreground">
            Strength:{' '}
            <span
              className={
                passwordStrength === 'Weak'
                  ? 'font-semibold text-red-500'
                  : passwordStrength === 'Medium'
                    ? 'font-semibold text-yellow-500'
                    : 'font-semibold text-green-500'
              }
            >
              {passwordStrength}
            </span>
          </p>
        ) : (
          <p id="password-hint" className="text-xs text-muted-foreground">
            12+ characters with uppercase, lowercase, number, and special character.
          </p>
        )}
        {fieldErrors.password ? (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            aria-label="Confirm Password"
            aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
            aria-invalid={!!fieldErrors.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
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
        <p className="text-xs text-muted-foreground">Must match the password above.</p>
        {fieldErrors.confirmPassword ? (
          <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      {/* Server-level submit error */}
      {submitError ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {submitError}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-label="Claim account"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up your account...
          </>
        ) : (
          'Claim account'
        )}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Page — reads token from URL search params and passes it to ClaimForm
// ---------------------------------------------------------------------------

/**
 * Vendor Claim Page (inner)
 *
 * Landing page for invited vendors. Validates the invitation token and
 * allows the recipient to set a password and activate their account.
 */
function ClaimPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Claim Your Vendor Account</h1>
        <p className="mt-2 text-muted-foreground">
          Set a password to activate your account and access the vendor dashboard.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ClaimForm token={token} />
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link href="/vendor/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl py-12 px-4">
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ClaimPageContent />
    </Suspense>
  );
}
