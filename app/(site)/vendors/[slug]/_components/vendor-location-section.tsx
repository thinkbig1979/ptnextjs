"use client";

import dynamicImport from "next/dynamic";
import { VendorLocationCard } from "@/components/VendorLocationCard";
import { VendorLocation } from "@/lib/types";

// Dynamically import VendorMap to avoid SSR issues with Leaflet
const VendorMap = dynamicImport(
  () =>
    import("@/components/VendorMap").then((mod) => ({
      default: mod.VendorMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

interface VendorLocationSectionProps {
  vendorName: string;
  location: VendorLocation & { latitude: number; longitude: number };
}

export function VendorLocationSection({
  vendorName,
  location,
}: VendorLocationSectionProps) {
  return (
    <div className="mb-6">
      <VendorMap
        name={vendorName}
        coordinates={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        height="400px"
        className="mb-6"
      />
      <VendorLocationCard name={vendorName} location={location} />
    </div>
  );
}
