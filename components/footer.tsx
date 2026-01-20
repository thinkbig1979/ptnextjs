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

          {/* Discover */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Discover</h2>
            <div className="space-y-2">
              <Link href="/discovery-platform" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Discovery Platform
              </Link>
              <Link href="/vendors" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Vendors
              </Link>
              <Link href="/products" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Products
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Services</h2>
            <div className="space-y-2">
              <Link href="/custom-lighting" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Custom Lighting
              </Link>
              <Link href="/consultancy" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Consultancy
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h2 className="font-poppins-medium text-sm font-semibold">Company</h2>
            <div className="space-y-2">
              <Link href="/about" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                About
              </Link>
              <Link href="/blog" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Contact
              </Link>
              <address className="not-italic pt-2 space-y-2">
                <a
                  href={`mailto:${companyInfo?.email || "contact@paulthames.com"}`}
                  className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors"
                  aria-label={`Email us at ${companyInfo?.email || "contact@paulthames.com"}`}
                >
                  <Mail className="h-4 w-4" />
                  <span>{companyInfo?.email || "contact@paulthames.com"}</span>
                </a>
                <a
                  href={`tel:${(companyInfo?.phone || "+31 20 123 4567").replace(/[\s\-\(\)]/g, '')}`}
                  className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors"
                  aria-label={`Call us at ${companyInfo?.phone || "+31 20 123 4567"}`}
                >
                  <Phone className="h-4 w-4" />
                  <span>{companyInfo?.phone || "+31 20 123 4567"}</span>
                </a>
                <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Amsterdam, Netherlands</span>
                </div>
              </address>
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
