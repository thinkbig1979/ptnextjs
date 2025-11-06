import { VendorLoginForm } from '@/components/vendor/VendorLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Login | Superyacht Platform',
  description: 'Login to your vendor account to manage your profile and products',
};

/**
 * Vendor Login Page
 *
 * Provides login interface for vendor authentication
 */
export default function VendorLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground dark:text-white">
            Vendor Login
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground dark:text-muted-foreground">
            Sign in to access your vendor dashboard
          </p>
        </div>
        <div className="mt-8 bg-card dark:bg-slate-900 py-8 px-4 shadow dark:shadow-xl sm:rounded-lg sm:px-10 border border-border dark:border-slate-800">
          <VendorLoginForm />
        </div>
      </div>
    </div>
  );
}
