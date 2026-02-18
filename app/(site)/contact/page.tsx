import * as React from 'react';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { payloadCMSDataService } from '@/lib/payload-cms-data-service';
import Breadcrumbs from '@/components/Breadcrumbs';

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Paul Thames | Superyacht Technical Consultancy',
  description: 'Get in touch with Paul Thames for superyacht technical consultancy, creative lighting, and vendor advisory services.',
  openGraph: {
    title: 'Contact Paul Thames | Superyacht Technical Consultancy',
    description: 'Get in touch with Paul Thames for superyacht technical consultancy, creative lighting, and vendor advisory services.',
    url: 'https://paulthames.com/contact',
  },
  twitter: {
    title: 'Contact Paul Thames | Superyacht Technical Consultancy',
    description: 'Get in touch with Paul Thames for superyacht technical consultancy, creative lighting, and vendor advisory services.',
  },
  alternates: {
    canonical: 'https://paulthames.com/contact',
  },
};

export default async function ContactPage() {
  // Fetch company info at build time
  const companyInfo = await payloadCMSDataService.getCompanyInfo();

  // Provide default values if companyInfo is null
  const email = companyInfo?.email || 'info@paulthames.com';
  const businessHours = companyInfo?.businessHours || 'Monday - Friday: 9:00 AM - 5:00 PM CET';

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Main Office',
      details: ['Herengracht 516', '1017 CC Amsterdam', 'The Netherlands'],
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+31 6 54657080'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: [email],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [businessHours],
    },
  ];
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]} />

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6 text-accent">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Whether you have a project question, need a second opinion on a specification, or
            want to discuss how we can support your team, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information Cards */}
          {contactInfo.map((info, _index) => (
            <div key={info.title}>
              <Card className="hover-lift h-full">
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-3 mb-2">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p
                        key={`${info.title}-detail-${idx}`}
                        className="text-sm text-muted-foreground font-poppins-light"
                      >
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* How We Work */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent text-center">
            How We Work
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground font-poppins-light leading-relaxed">
            <p>
              Initial conversations are informal and without obligation. We'll discuss your
              project, timeline, and what kind of support would be most useful, whether
              that's a one-off specification review, ongoing technical advisory, or market
              access for your products.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-accent/5 rounded-xl p-6 border border-accent/10">
                <h3 className="font-poppins-medium text-foreground mb-2">For project teams</h3>
                <p className="text-sm">
                  Share your project stage and technical requirements. We'll outline how our
                  focused consultancy can add value at your current phase.
                </p>
              </div>
              <div className="bg-accent/5 rounded-xl p-6 border border-accent/10">
                <h3 className="font-poppins-medium text-foreground mb-2">For suppliers</h3>
                <p className="text-sm">
                  Tell us about your product and target market. We'll give you an honest
                  assessment of the opportunity in superyacht and how to approach it.
                </p>
              </div>
            </div>
            <p className="text-sm text-center">
              Response times are typically within one working day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
