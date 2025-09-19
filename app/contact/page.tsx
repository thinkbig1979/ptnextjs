

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { tinaCMSDataService } from "@/lib/tinacms-data-service";
import { ContactClient } from "./_components/contact-client";

export default async function ContactPage() {
  // Fetch company info at build time
  const companyInfo = await tinaCMSDataService.getCompanyInfo();
  
  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: [companyInfo.address],
    },
    {
      icon: Phone,
      title: "Phone",
      details: [companyInfo.phone],
    },
    {
      icon: Mail,
      title: "Email",
      details: [companyInfo.email, "sales@paulthames.com"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM CET", "Weekend: By appointment"],
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-cormorant font-bold mb-6">Get In Touch</h2>
              <p className="text-muted-foreground font-poppins-light mb-8">
                We&apos;re here to help you find the perfect technology solutions for your superyacht. 
                Contact us using any of the methods below.
              </p>
            </div>

            {contactInfo.map((info, _index) => (
              <div key={info.title}>
                <Card className="hover-lift">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <info.icon className="w-5 h-5 text-accent" />
                      </div>
                      <CardTitle className="text-lg">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
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

            {/* Map Placeholder */}
            <div>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="w-8 h-8 text-accent mx-auto" />
                    <p className="text-sm font-poppins-medium">Amsterdam, Netherlands</p>
                    <p className="text-xs text-muted-foreground font-poppins-light">
                      Maritime Technology Hub
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Form - Client Component */}
          <div className="lg:col-span-2">
            <ContactClient />
          </div>
        </div>
      </div>
    </div>
  );
}
