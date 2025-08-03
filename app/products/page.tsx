
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SuspenseWrapper } from "@/components/suspense-wrapper";
import { ProductsClient } from "@/components/products-client";

export default function ProductsPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-4">
            Products & Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins-light">
            Explore cutting-edge superyacht technology solutions from our trusted partners across all categories
          </p>
        </motion.div>

        {/* Client-side content wrapped in Suspense */}
        <SuspenseWrapper fallback={<div className="space-y-8 animate-pulse">
          <div className="h-12 bg-muted/20 rounded" />
          <div className="h-6 bg-muted/20 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted/20 rounded-lg" />
            ))}
          </div>
        </div>}>
          <ProductsClient />
        </SuspenseWrapper>
      </div>
    </div>
  );
}
