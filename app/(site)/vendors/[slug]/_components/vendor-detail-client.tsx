"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { ensureUrlProtocol } from "@/lib/utils/url";
import type { Vendor } from "@/lib/types";

interface VendorDetailClientProps {
  vendor: Vendor;
}

export default function VendorDetailClient({ vendor }: VendorDetailClientProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Format phone number for tel: link (remove spaces, dashes, parentheses)
  const formatPhoneForTel = (phone: string): string => {
    return phone.replace(/[\s\-\(\)]/g, '');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-3"
    >
      {/* Phone link - uses tel: for accessibility */}
      {vendor.contactPhone ? (
        <Button className="w-full bg-accent hover:bg-accent/90" asChild>
          <a href={`tel:${formatPhoneForTel(vendor.contactPhone)}`} aria-label={`Call ${vendor.name} at ${vendor.contactPhone}`}>
            <Phone className="w-4 h-4 mr-2" />
            Call Vendor
          </a>
        </Button>
      ) : (
        <Button className="w-full bg-accent hover:bg-accent/90" disabled aria-label="Phone number not available">
          <Phone className="w-4 h-4 mr-2" />
          Call Vendor
        </Button>
      )}

      {/* Email link - uses mailto: for accessibility */}
      {vendor.contactEmail ? (
        <Button variant="outline" className="w-full" asChild>
          <a href={`mailto:${vendor.contactEmail}`} aria-label={`Send email to ${vendor.name}`}>
            <Mail className="w-4 h-4 mr-2" />
            Send Message
          </a>
        </Button>
      ) : (
        <Button variant="outline" className="w-full" disabled aria-label="Email not available">
          <Mail className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      )}

      {vendor.website && (
        <Button variant="outline" className="w-full" asChild>
          <a href={ensureUrlProtocol(vendor.website)} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${vendor.name} website`}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Website
          </a>
        </Button>
      )}
    </motion.div>
  );
}