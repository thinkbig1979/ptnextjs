"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export interface VendorToggleProps {
  value: "partners" | "all";
  onValueChange: (value: "partners" | "all") => void;
  isLoading?: boolean;
}

export function VendorToggle({ value, onValueChange, isLoading = false }: VendorToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center space-x-4 p-6 rounded-lg bg-card border"
    >
      <Label 
        htmlFor="vendor-toggle" 
        className={`font-poppins-medium transition-colors cursor-pointer ${
          value === "partners" ? "text-foreground" : "text-muted-foreground"
        }`}
        onClick={() => onValueChange("partners")}
      >
        Partner Products
      </Label>
      
      <Switch
        id="vendor-toggle"
        checked={value === "all"}
        onCheckedChange={(checked) => onValueChange(checked ? "all" : "partners")}
        disabled={isLoading}
        className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted"
      />
      
      <Label 
        htmlFor="vendor-toggle" 
        className={`font-poppins-medium transition-colors cursor-pointer ${
          value === "all" ? "text-foreground" : "text-muted-foreground"
        }`}
        onClick={() => onValueChange("all")}
      >
        All Vendors
      </Label>
      
      {isLoading && (
        <div className="ml-2">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}