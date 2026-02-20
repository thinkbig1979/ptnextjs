'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import GeocodingService from '@/lib/services/GeocodingService';
interface GeocodingButtonProps {
  address: string;
  onSuccess: (latitude: number, longitude: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
/**
 * GeocodingButton - Convert address to coordinates
 */
export function GeocodingButton({
  address,
  onSuccess,
  onError,
  className = '',
  variant = 'default',
  size = 'default',
}: GeocodingButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleGeocode = useCallback(async () => {
    if (!address || typeof address !== 'string') {
      toast.error('Please enter a valid address');
      return;
    }
    setLoading(true);
    try {
      const result = await GeocodingService.geocode(address);
      onSuccess(result.latitude, result.longitude);
      toast.success(
        `Coordinates found: ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to geocode address';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [address, onSuccess, onError]);
  const isDisabled = loading || !address?.trim();
  const buttonTitle = isDisabled
    ? 'Please enter an address to geocode'
    : 'Click to find coordinates for the address';
  return (
    <Button
      onClick={handleGeocode}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
      title={buttonTitle}
      data-testid="geocoding-button"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Geocoding...
        </>
      ) : (
        <>
          <MapPin className="mr-2 h-4 w-4" />
          Find Coordinates
        </>
      )}
    </Button>
  );
}
