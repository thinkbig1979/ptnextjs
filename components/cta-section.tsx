

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export function CTASection(): React.JSX.Element {
  return (
    <section className="py-20 bg-accent text-accent-foreground relative overflow-hidden" aria-label="Call to action">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-card blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-card blur-3xl"></div>
      </div>

      <div className="container max-w-screen-xl relative z-10">
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-cormorant font-bold">
            Considering a New Build or Refit?
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto font-poppins-light opacity-90">
            The earlier we're involved, the more leverage you have.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Discuss Your Project
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="border-accent-foreground/30 hover:bg-accent-foreground/10">
              <Link href="/consultancy/clients">
                View Consultancy Services
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
