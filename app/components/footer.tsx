
import Link from "next/link";
import { Anchor, Mail, Phone, MapPin } from "lucide-react";
interface FooterProps {
  companyInfo?: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
  };
}

export function Footer({ companyInfo }: FooterProps) {
  // Default company info if not provided
  const company = companyInfo || {
    name: 'Paul Thames',
    tagline: 'Connecting Superyacht Technology Excellence',
    email: 'info@paulthames.com',
    phone: '+31 20 555 0123',
    address: 'Amsterdam, Netherlands'
  };
  return (
    <footer className="bg-card border-t">
      <div className="container max-w-screen-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Anchor className="h-6 w-6 text-accent" />
              <span className="font-cormorant text-xl font-bold">Paul Thames</span>
            </div>
            <p className="font-poppins-light text-sm text-muted-foreground">
              {company.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-poppins-medium text-sm font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/partners" className="block font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                Partners
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
            <h3 className="font-poppins-medium text-sm font-semibold">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </div>
              <div className="flex items-center space-x-2 font-poppins-light text-sm text-muted-foreground hover:text-accent transition-colors">
                <MapPin className="h-4 w-4" />
                <span>Amsterdam, Netherlands</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-poppins-medium text-sm font-semibold">Resources</h3>
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
