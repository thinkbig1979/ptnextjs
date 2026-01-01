import { Metadata } from 'next';
import Link from 'next/link';
import { VendorRegistrationForm } from '@/components/vendor/VendorRegistrationForm';

export const metadata: Metadata = {
  title: 'Vendor Registration | Platform',
  description: 'Register your company as a vendor on our platform',
};

/**
 * Vendor Registration Page
 *
 * Public page where new vendors can register their company.
 * After registration, vendors must wait for admin approval.
 */
export default function VendorRegisterPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Vendor Registration</h1>
        <p className="mt-2 text-muted-foreground">
          Register your company to become a vendor on our platform
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <VendorRegistrationForm />
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
