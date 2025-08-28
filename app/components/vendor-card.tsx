"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, ExternalLink, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Vendor, Product } from "@/lib/types";

interface VendorCardProps {
  vendor: Vendor;
  vendorProducts: Product[];
  isHighlighted?: boolean;
  animationIndex?: number;
  inView?: boolean;
  onCategoryClick?: (category: string) => void;
  onNavigateToProducts?: (vendorName: string) => void;
  baseUrl?: string; // "/partners" or "/vendors"
}

export function VendorCard({
  vendor,
  vendorProducts,
  isHighlighted = false,
  animationIndex = 0,
  inView = true,
  onCategoryClick,
  onNavigateToProducts,
  baseUrl = "/partners"
}: VendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: 0.1 * animationIndex }}
    >
      <Card className={`h-full hover-lift cursor-pointer group ${isHighlighted ? 'ring-2 ring-accent shadow-lg' : ''}`}>
        {/* Company Logo */}
        <OptimizedImage
          src={vendor?.logo}
          alt={`${vendor?.name} company logo` || 'Vendor company logo'}
          fallbackType="partner"
          aspectRatio="video"
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-contain bg-white p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              {vendor?.featured && (
                <Badge variant="default" className="bg-accent">Featured</Badge>
              )}
              {isHighlighted && (
                <Badge variant="default" className="bg-green-500">Highlighted</Badge>
              )}
            </div>
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick?.(vendor?.category || '');
              }}
            >
              {vendor?.category}
            </Badge>
          </div>
          <CardTitle className="group-hover:text-accent transition-colors">
            <Link 
              href={`${baseUrl}/${vendor?.slug}`}
              className="hover:underline"
            >
              {vendor?.name}
            </Link>
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {vendor?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {vendor?.tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Est. {vendor?.founded}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{vendor?.location}</span>
              </div>
            </div>

            {/* Products Count */}
            {vendorProducts.length > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Package className="w-3 h-3" />
                <span>{vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {vendorProducts.length > 0 && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full group bg-accent hover:bg-accent/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToProducts?.(vendor?.name || '');
                  }}
                >
                  See Products & Services ({vendorProducts.length})
                  <Package className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              
              <Button 
                asChild
                variant="outline" 
                size="sm" 
                className="w-full group"
              >
                <Link href={`${baseUrl}/${vendor?.slug}`}>
                  Learn More
                  <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              {vendor?.website && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group"
                  asChild
                >
                  <Link href={vendor.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}