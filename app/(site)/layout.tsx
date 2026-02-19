import type { Metadata } from 'next';
import { Cormorant, Poppins } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { FooterWrapper } from '@/components/footer-wrapper';
import { Toaster } from '@/components/ui/sonner';
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';
import { AuthProvider } from '@/lib/context/AuthContext';

const cormorant = Cormorant({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

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
    title: {
      template: '%s | Paul Thames',
      default: 'Paul Thames | Technical Consultancy & Creative Lighting',
    },
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
    title: {
      template: '%s | Paul Thames',
      default: 'Paul Thames | Technical Consultancy & Creative Lighting',
    },
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
    <html lang="en" className={`${cormorant.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8f9fb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000029" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme-preference');var t=s&&s!=='system'?s:window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
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
      <Script
          src="https://webanalytics.paulthames.com/script.js"
          data-entity="paulthames-home"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
