import * as React from "react";
import Link from "next/link";
import { Anchor, Mail, Phone, MapPin } from "lucide-react";
import type { CompanyInfo } from "@/lib/types";

interface FooterProps {
  companyInfo?: CompanyInfo;
}

export function Footer({ companyInfo }: FooterProps): React.JSX.Element {
  return (
    <footer className="bg-card border-t" role="contentinfo">
      <div className="container max-w-screen-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Anchor className="h-6 w-6 text-accent" />
              <span className="font-cormorant text-xl font-bold">Paul Thames</span>
            </div>
            <p className="font-poppins-light text-sm text-muted-foreground">
              {companyInfo?.tagline || "Excellence in superyacht technology solutions"}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Quick Links</h2>
            <div className="space-y-2">
              <Link href="/vendors" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Vendors
              </Link>
              <Link href="/products" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Products & Services
              </Link>
              <Link href="/about" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Mail className="h-4 w-4" />
                <span>{companyInfo?.email || "contact@paulthames.com"}</span>
              </div>
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Phone className="h-4 w-4" />
                <span>{companyInfo?.phone || "+31 20 123 4567"}</span>
              </div>
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Amsterdam, Netherlands</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Resources</h2>
            <div className="space-y-2">
              <Link href="/blog" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="font-poppins-light text-sm text-muted-foreground">
            © {new Date().getFullYear()} Paul Thames. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
