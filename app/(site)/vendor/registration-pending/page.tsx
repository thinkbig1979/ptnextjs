import { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Registration Pending | Platform',
  description: 'Your vendor registration is pending approval',
};

/**
 * Registration Pending Page
 *
 * Confirmation page shown after successful vendor registration.
 * Informs the vendor that their account is pending admin approval.
 */
export default function RegistrationPendingPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Registration Successful!
        </h1>

        <p className="text-lg text-muted-foreground mb-6">
          Your account is pending approval
        </p>

        <div className="max-w-md mx-auto space-y-4 text-left mb-8">
          <div className="rounded-lg bg-muted p-4">
            <h2 className="font-semibold mb-2">What happens next?</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Our team will review your registration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>You&apos;ll receive an email notification once your account is approved</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>After approval, you can log in and access your vendor dashboard</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> The approval process typically takes 1-2 business days.
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
