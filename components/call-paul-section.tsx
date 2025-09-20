import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CallPaulSectionProps {
  className?: string;
}

export function CallPaulSection({ className }: CallPaulSectionProps) {
  return (
    <section className={cn("py-16 px-6 bg-secondary/50 text-center", className)}>
      <div className="max-w-4xl mx-auto space-y-8">
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          The first thing you should always do when embarking on a new-build or refit project...
        </p>
        <h2 className="text-4xl md:text-5xl font-cormorant font-extrabold text-accent">
          CALL PAUL!
        </h2>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-10 py-4 rounded-full shadow-lg transition-all"
          asChild
        >
          <a href="mailto:info@paulthames.com?subject=New Project Inquiry">
            Start the Conversation
          </a>
        </Button>
      </div>
    </section>
  );
}