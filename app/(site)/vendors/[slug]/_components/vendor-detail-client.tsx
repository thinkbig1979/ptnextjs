"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { 
  Phone,
  Mail,
  ExternalLink,
  Globe
} from "lucide-react";
import type { Vendor } from "@/lib/types";

interface VendorDetailClientProps {
  vendor: Vendor;
}

export default function VendorDetailClient({ vendor }: VendorDetailClientProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Handler functions
  const handleCallVendor = () => {
    alert(`Calling ${vendor?.name}. You will be connected to their main office shortly.`);
  };

  const handleSendMessage = () => {
    alert(`Opening contact form for ${vendor?.name}. You will be redirected to send a message.`);
  };

  const handleFindDealer = () => {
    alert(`Finding local dealers for ${vendor?.name}. Dealer locator will open shortly.`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-3"
    >
      <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleCallVendor}>
        <Phone className="w-4 h-4 mr-2" />
        Call Vendor
      </Button>
      
      <Button variant="outline" className="w-full" onClick={handleSendMessage}>
        <Mail className="w-4 h-4 mr-2" />
        Send Message
      </Button>
      
      {vendor.website && (
        <Button variant="outline" className="w-full" asChild>
          <a href={vendor.website} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Website
          </a>
        </Button>
      )}
      
      <Button variant="outline" className="w-full" onClick={handleFindDealer}>
        <Globe className="w-4 h-4 mr-2" />
        Find Local Dealer
      </Button>
    </motion.div>
  );
}