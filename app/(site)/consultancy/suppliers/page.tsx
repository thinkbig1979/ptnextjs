import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Consultancy for Suppliers | Paul Thames",
  description: "Supply-side consultancy services for manufacturers and integrators looking to enter or expand in the superyacht technology market.",
};

export default function ConsultancySuppliersPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-screen-xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="group">
            <Link href="/consultancy">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Consultancy
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-cormorant font-bold mb-8 text-accent">
            Consultancy for Suppliers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-poppins-light leading-relaxed">
            Supply-side services for manufacturers and integrators looking to enter or expand in the superyacht market.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-accent font-poppins-medium text-lg">Coming Soon</span>
          </div>
          <p className="mt-6 text-muted-foreground font-poppins-light max-w-2xl mx-auto">
            We are preparing detailed information about our supplier-focused consultancy services, including market entry strategy, partnership development, and product positioning for the superyacht industry.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="mb-20">
          <div className="bg-muted/30 rounded-2xl p-12 border border-border text-center">
            <h2 className="text-2xl md:text-3xl font-cormorant font-bold mb-6 text-foreground">
              Services for Manufacturers & Integrators
            </h2>
            <p className="text-lg text-muted-foreground font-poppins-light max-w-2xl mx-auto mb-8">
              Our supplier consultancy services will include market entry strategy, partnership facilitation, product positioning, and connections to key stakeholders in the superyacht technology ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Market Entry", "Partnership Development", "Product Positioning", "Industry Connections"].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-poppins-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-accent/5 rounded-2xl p-12 border border-accent/20">
            <h2 className="text-3xl md:text-4xl font-cormorant font-bold mb-6 text-accent">
              Looking to Enter the Superyacht Market?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground font-poppins-light">
              Contact us to discuss how we can help you reach the superyacht industry.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-full">
              <a href="mailto:info@paulthames.com?subject=Supplier Consultancy Inquiry">
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
