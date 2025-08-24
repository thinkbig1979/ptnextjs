
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { 
  Phone,
  Mail,
  Download,
  Play
} from "lucide-react";
import type { Product, Partner } from "@/lib/types";

interface ProductDetailClientProps {
  product: Product;
  partner: Partner | undefined;
}

export default function ProductDetailClient({ product, partner }: ProductDetailClientProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Handler functions
  const handleRequestQuote = () => {
    alert(`Quote request for "${product?.name}" has been submitted. Our sales team will contact you shortly.`);
  };

  const handleContactSales = () => {
    alert(`Contacting sales team about "${product?.name}". You will be redirected to our contact form.`);
  };

  const handleDownloadBrochure = () => {
    alert(`Downloading brochure for "${product?.name}". The download will start shortly.`);
  };

  const handleDemoVideo = () => {
    alert(`Opening demo video for "${product?.name}". The video player will launch shortly.`);
  };

  return (
    <div className="space-y-3">
      <Button className="w-full bg-accent hover:bg-accent/90 h-auto py-3" onClick={handleRequestQuote}>
        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="break-words">Request Quote</span>
      </Button>
      
      <Button variant="outline" className="w-full h-auto py-3" onClick={handleContactSales}>
        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="break-words">Contact Sales</span>
      </Button>
      
      <Button variant="outline" className="w-full h-auto py-3" onClick={handleDownloadBrochure}>
        <Download className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="break-words">Download Brochure</span>
      </Button>
      
      {/* Demo Video Button */}
      <Button 
        variant="secondary" 
        className="w-full h-auto py-3"
        onClick={handleDemoVideo}
      >
        <Play className="w-4 h-4 mr-2" />
        Demo Video
      </Button>
    </div>
  );
}
