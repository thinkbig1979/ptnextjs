'use client';

import React, { useState } from 'react';
import type { FieldClientComponent } from 'payload';

export const GeocodingButton: FieldClientComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleGeocode = async () => {
    // Get address value from the form using DOM
    const addressInput = document.querySelector<HTMLInputElement>('[name="location.address"]');
    const latitudeInput = document.querySelector<HTMLInputElement>('[name="location.latitude"]');
    const longitudeInput = document.querySelector<HTMLInputElement>('[name="location.longitude"]');

    if (!addressInput || !latitudeInput || !longitudeInput) {
      setMessage({
        type: 'error',
        text: 'Form fields not found',
      });
      return;
    }

    const address = addressInput.value;

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
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to geocode address',
        });
        return;
      }

      // Update form fields with geocoding results
      latitudeInput.value = data.latitude.toString();
      longitudeInput.value = data.longitude.toString();

      // Trigger input events so form state updates
      latitudeInput.dispatchEvent(new Event('input', { bubbles: true }));
      longitudeInput.dispatchEvent(new Event('input', { bubbles: true }));

      setMessage({
        type: 'success',
        text: `Coordinates found: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
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

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={handleGeocode}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          backgroundColor: isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {isLoading ? 'Geocoding...' : '🔍 Get Coordinates from Address'}
      </button>
      {message && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
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
    </div>
  );
};
