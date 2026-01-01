import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface FounderCardProps {
  name: string;
  role: string;
  avatar?: string;
  specialties?: string[];
  description?: string;
  className?: string;
}

export function FounderCard({
  name,
  role,
  avatar,
  specialties,
  description,
  className,
}: FounderCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn("w-full max-w-sm mx-auto transition-all duration-200 hover:shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar Section */}
          <Avatar className="h-20 w-20 border-2 border-border">
            {avatar ? (
              <AvatarImage
                src={avatar}
                alt={`${name} profile photo`}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name and Role */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight font-cormorant">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-poppins-light">
              {role}
            </p>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground font-poppins-light leading-relaxed">
              {description}
            </p>
          )}

          {/* Specialties */}
          {specialties && specialties.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Specialties
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {specialties.map((specialty) => (
                  <span
                    key={`specialty-${specialty}`}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-poppins-light"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}