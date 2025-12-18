import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { payloadCMSDataService } from "@/lib/payload-cms-data-service";

// Force dynamic rendering - database not available at Docker build time
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  // Fetch company info at build time
  const companyInfo = await payloadCMSDataService.getCompanyInfo();

  // Provide default values if companyInfo is null
  const address = companyInfo?.address || "Amsterdam, Netherlands";
  const phone = companyInfo?.phone || "+31 20 555 0123";
  const email = companyInfo?.email || "info@paulthames.com";
  const businessHours = companyInfo?.businessHours || "Monday - Friday: 9:00 AM - 5:00 PM CET";

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: [address],
    },
    {
      icon: Phone,
      title: "Phone",
      details: [phone],
    },
    {
      icon: Mail,
      title: "Email",
      details: [email],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [businessHours],
    },
  ];
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins-light leading-relaxed">
            Ready to explore cutting-edge superyacht technology? Get in touch with our experts today.
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
                      <p key={idx} className="text-sm text-muted-foreground font-poppins-light">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
