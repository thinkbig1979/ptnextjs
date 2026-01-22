import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LightingConceptCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}

export function LightingConceptCard({
  icon: Icon,
  title,
  description,
  className,
}: LightingConceptCardProps) {
  return (
    <Card
      className={cn(
        "text-center border-accent/10 bg-card/50 backdrop-blur-sm",
        "transition-all duration-300 hover:border-accent/20 hover:bg-card/60",
        className
      )}
    >
      <CardHeader>
        <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-accent/15" aria-hidden="true">
          <Icon className="w-8 h-8 text-accent" />
        </div>
        <CardTitle className="text-xl font-cormorant">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground font-poppins-light text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
