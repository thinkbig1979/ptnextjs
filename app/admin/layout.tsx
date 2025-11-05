import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Marine Technology Platform',
  description: 'Admin panel for managing vendor approvals',
  robots: 'noindex, nofollow',
};

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
