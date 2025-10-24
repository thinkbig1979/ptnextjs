'use client';

import React, { useState } from 'react';
import type { FieldClientComponent } from 'payload';
import { useForm, useFormFields } from '@payloadcms/ui';

/**
 * GeocodingButton - Elegant Payload CMS integration for address geocoding
 *
 * This component properly integrates with Payload's form state management
 * using the useForm hook to update field values through the form API.
 */
export const GeocodingButton: FieldClientComponent = ({ path }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Get Payload's form dispatch methods
  const { dispatchFields } = useForm();

  // Get parent path (array row path) - remove the UI field name from path
  const parentPath = (path as string).split('.').slice(0, -1).join('.');

  // Get current address value from form state
  const addressField = useFormFields(([fields]) => fields[`${parentPath}.address`]);
  const address = addressField?.value as string;

  const handleGeocode = async () => {
    // Validate address from form state
    if (!address || address.trim().length === 0) {
      setMessage({
        type: 'error',
        text: 'Please enter an address first',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Use GET request with query parameter (matching the API endpoint)
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}&limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to geocode address',
        });
        return;
      }

      // Check if we got results
      if (!data.success || !data.results || data.results.length === 0) {
        setMessage({
          type: 'error',
          text: 'No results found for this address',
        });
        return;
      }

      // Extract coordinates from the first result
      const firstResult = data.results[0];
      const coordinates = firstResult.geometry?.coordinates;

      if (!coordinates || coordinates.length < 2) {
        setMessage({
          type: 'error',
          text: 'Invalid coordinates in response',
        });
        return;
      }

      // Photon returns [longitude, latitude] (GeoJSON format)
      const latitude = coordinates[1];
      const longitude = coordinates[0];

      // Extract address components from Photon response
      const properties = firstResult.properties || {};

      // Extract values
      const city = properties.city || properties.town || properties.village || properties.state || '';
      const country = properties.country || '';
      const postalCode = properties.postcode || '';

      // Update all fields through Payload's form dispatch
      // This is the proper way to update form state in Payload CMS
      dispatchFields({
        type: 'UPDATE',
        path: `${parentPath}.latitude`,
        value: latitude,
      });

      dispatchFields({
        type: 'UPDATE',
        path: `${parentPath}.longitude`,
        value: longitude,
      });

      if (city) {
        dispatchFields({
          type: 'UPDATE',
          path: `${parentPath}.city`,
          value: city,
        });
      }

      if (country) {
        dispatchFields({
          type: 'UPDATE',
          path: `${parentPath}.country`,
          value: country,
        });
      }

      if (postalCode) {
        dispatchFields({
          type: 'UPDATE',
          path: `${parentPath}.postalCode`,
          value: postalCode,
        });
      }

      // Build success message showing what was populated
      const populatedFields = [
        `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city && `City: ${city}`,
        country && `Country: ${country}`,
        postalCode && `Postal: ${postalCode}`,
      ].filter(Boolean).join(' | ');

      setMessage({
        type: 'success',
        text: populatedFields,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to geocode address. Please try again.',
      });
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAddress = address && address.trim().length > 0;
  const isDisabled = isLoading || !hasAddress;

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={handleGeocode}
        disabled={isDisabled}
        style={{
          padding: '10px 16px',
          backgroundColor: isDisabled ? '#e0e0e0' : '#0070f3',
          color: isDisabled ? '#999' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        title={!hasAddress ? 'Please enter an address first' : 'Click to geocode address'}
      >
        <span>{isLoading ? '⏳' : '🔍'}</span>
        <span>{isLoading ? 'Geocoding...' : 'Get Coordinates from Address'}</span>
      </button>
      {message && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.5',
            backgroundColor:
              message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${
              message.type === 'success' ? '#c3e6cb' : '#f5c6cb'
            }`,
          }}
        >
          {message.text}
        </div>
      )}
      {!hasAddress && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          Enter an address above to enable geocoding
        </div>
      )}
    </div>
  );
};
