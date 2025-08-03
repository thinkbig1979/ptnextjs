
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface AboutClientProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    bio?: string;
  } | null;
}

export function AboutClient({ member }: AboutClientProps) {
  if (!member?.email) return null;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full group"
      onClick={() => window.open(`mailto:${member.email}`, '_blank')}
    >
      <Mail className="mr-2 h-3 w-3" />
      Contact
    </Button>
  );
}
