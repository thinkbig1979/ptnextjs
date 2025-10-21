"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export interface VendorToggleProps {
  value: "partners" | "all";
  onValueChange: (value: "partners" | "all") => void;
  isLoading?: boolean;
  partnersLabel?: string;
  allLabel?: string;
}

export function VendorToggle({
  value,
  onValueChange,
  isLoading = false,
  partnersLabel = "Partner Products",
  allLabel = "All Vendors"
}: VendorToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center space-x-4 p-6 rounded-lg bg-card border-2 border-accent/20 shadow-lg"
    >
      <Label
        htmlFor="vendor-toggle"
        className={`font-poppins-semibold text-sm transition-colors cursor-pointer px-3 py-2 rounded-md ${
          value === "partners"
            ? "text-accent-foreground bg-accent shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
        }`}
        onClick={() => onValueChange("partners")}
      >
        {partnersLabel}
      </Label>

      <Switch
        id="vendor-toggle"
        checked={value === "all"}
        onCheckedChange={(checked) => onValueChange(checked ? "all" : "partners")}
        disabled={isLoading}
        className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted-foreground/30 scale-110 border-2 border-accent/30"
      />

      <Label
        htmlFor="vendor-toggle"
        className={`font-poppins-semibold text-sm transition-colors cursor-pointer px-3 py-2 rounded-md ${
          value === "all"
            ? "text-accent-foreground bg-accent shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
        }`}
        onClick={() => onValueChange("all")}
      >
        {allLabel}
      </Label>

      {isLoading && (
        <div className="ml-2">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}