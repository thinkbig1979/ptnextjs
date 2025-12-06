'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Payload Admin Logout Button Component
 *
 * Custom logout button for the Payload CMS admin panel.
 * This button will log the user out of Payload and redirect to the login page.
 */
export const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      // Call Payload's logout endpoint
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Redirect to admin login page
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#b91c1c';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#dc2626';
      }}
    >
      Logout
    </button>
  );
};
