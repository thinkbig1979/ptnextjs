import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { FooterWrapper } from '@/components/footer-wrapper';
import { Toaster } from '@/components/ui/sonner';
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';
import { AuthProvider } from '@/lib/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://paulthames.com'),
  title: 'Paul Thames | Technical Consultancy & Creative Lighting',
  description:
    'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
  keywords:
    'superyacht consultancy, creative lighting, marine technology, yacht lighting, technical advisory, AV/IT systems, vendor consultancy',
  authors: [{ name: 'Paul Thames' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://paulthames.com',
    title: 'Paul Thames | Technical Consultancy & Creative Lighting',
    description:
      'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
    siteName: 'Paul Thames',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Paul Thames - Technical Consultancy & Creative Lighting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paul Thames | Technical Consultancy & Creative Lighting',
    description:
      'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: './',
  },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Fetch company info for footer (skip during Docker builds)
  let companyInfo = null;
  if (process.env.SKIP_BUILD_DB !== 'true') {
    try {
      companyInfo = await payloadCMSDataService.getCompanyInfo();
    } catch (error) {
      console.warn(
        '⚠️  Could not fetch company info (DB unavailable):',
        error instanceof Error ? error.message : error
      );
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8f9fb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000029" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/leaflet/leaflet.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Enhanced Firefox mobile theme detection
                  function detectTheme() {
                    const isFirefoxMobile = /Firefox.*Mobile/.test(navigator.userAgent) ||
                                           (/Firefox/.test(navigator.userAgent) && /Android/.test(navigator.userAgent));

                    // Get stored preference
                    const stored = localStorage.getItem('theme-preference');
                    if (stored && stored !== 'system') return stored;

                    // System theme detection with Firefox mobile fallbacks
                    if (window.matchMedia) {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        return 'dark';
                      }

                      // Firefox mobile specific fallbacks
                      if (isFirefoxMobile) {
                        // Try alternative detection methods
                        try {
                          const testEl = document.createElement('div');
                          testEl.style.display = 'none';
                          testEl.style.colorScheme = 'dark light';
                          document.documentElement.appendChild(testEl);

                          const computed = getComputedStyle(testEl);
                          const isDark = computed.colorScheme && computed.colorScheme.includes('dark');

                          document.documentElement.removeChild(testEl);

                          if (isDark) return 'dark';

                          // Time-based heuristic as last resort
                          const hour = new Date().getHours();
                          if (hour < 6 || hour > 20) return 'dark';

                        } catch (e) {
                          console.debug('Early theme detection failed:', e);
                        }
                      }
                    }

                    return 'light';
                  }

                  const theme = detectTheme();
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  // Add a data attribute for debugging
                  document.documentElement.setAttribute('data-initial-theme', theme);

                } catch (e) {
                  console.debug('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <FooterWrapper companyInfo={companyInfo || undefined} />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
