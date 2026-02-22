'use client';

import React, { useState, useEffect, useCallback } from 'react';

import type { FieldClientComponent } from 'payload';
import { useDocumentInfo, useFormFields } from '@payloadcms/ui';

type InvitationStatus = 'pending' | 'claimed' | 'expired' | 'revoked';

interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  claimedAt?: string;
  createdAt: string;
}

interface ApiError {
  error: string;
}

const STATUS_COLORS: Record<InvitationStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: '#fff3cd', text: '#856404', border: '#ffc107' },
  claimed: { bg: '#d4edda', text: '#155724', border: '#28a745' },
  expired: { bg: '#f8d7da', text: '#721c24', border: '#dc3545' },
  revoked: { bg: '#e2e3e5', text: '#383d41', border: '#6c757d' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const VendorInvitePanel: FieldClientComponent = () => {
  const { id: vendorId } = useDocumentInfo();

  const claimStatusField = useFormFields(([fields]) => fields.claimStatus);
  const contactEmailField = useFormFields(([fields]) => fields.contactEmail);
  const userField = useFormFields(([fields]) => fields.user);

  const claimStatus = claimStatusField?.value as string | undefined;
  const contactEmail = contactEmailField?.value as string | undefined;
  const hasUser = Boolean(userField?.value);

  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pre-fill email from contactEmail on mount
  useEffect(() => {
    if (contactEmail && !email) {
      setEmail(contactEmail);
    }
    // Only run when contactEmail first becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactEmail]);

  const fetchInvitations = useCallback(async () => {
    if (!vendorId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/admin/vendor-invitations?vendorId=${vendorId}`);
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations ?? []);
      }
    } catch {
      // Silently fail - history is supplementary
    } finally {
      setIsFetching(false);
    }
  }, [vendorId]);

  // Fetch invitation history on mount
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleSendInvitation = async (): Promise<void> => {
    if (!vendorId || !email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/vendor-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errData = data as ApiError;
        setMessage({ type: 'error', text: errData.error || 'Failed to send invitation' });
        return;
      }

      setMessage({ type: 'success', text: `Invitation sent to ${email.trim()}` });
      // Refresh history
      await fetchInvitations();
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render for new (unsaved) vendors
  if (!vendorId) {
    return (
      <div style={{ padding: '12px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
        Save the vendor first to enable invitations.
      </div>
    );
  }

  // Vendor already has a user - show claimed state
  if (hasUser || claimStatus === 'claimed') {
    return (
      <div style={{ padding: '12px' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: STATUS_COLORS.claimed.bg,
            color: STATUS_COLORS.claimed.text,
            border: `1px solid ${STATUS_COLORS.claimed.border}`,
          }}
        >
          Profile Claimed
        </div>
        {invitations.length > 0 ? (
          <div style={{ marginTop: '12px' }}>
            <InvitationHistory invitations={invitations} isFetching={isFetching} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ padding: '12px' }}>
      {/* Invite Form */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '6px',
            color: '#333',
          }}
        >
          Recipient Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vendor@example.com"
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '13px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
            marginBottom: '8px',
          }}
        />
        <button
          type="button"
          onClick={handleSendInvitation}
          disabled={isLoading || !email.trim()}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: isLoading || !email.trim() ? '#e0e0e0' : '#0070f3',
            color: isLoading || !email.trim() ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : claimStatus === 'invited' ? 'Resend Invitation' : 'Send Invitation'}
        </button>
      </div>

      {/* Status Message */}
      {message ? (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '12px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      ) : null}

      {/* Invitation History */}
      <InvitationHistory
        invitations={invitations}
        isFetching={isFetching}
        onResend={(invEmail: string) => {
          setEmail(invEmail);
          handleSendInvitation();
        }}
      />
    </div>
  );
};

function InvitationHistory({
  invitations,
  isFetching,
  onResend,
}: {
  invitations: Invitation[];
  isFetching: boolean;
  onResend?: (email: string) => void;
}) {
  if (isFetching && invitations.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
        Loading history...
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#666',
          marginBottom: '8px',
          letterSpacing: '0.5px',
        }}
      >
        Invitation History
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {invitations.map((inv) => {
          const colors = STATUS_COLORS[inv.status] ?? STATUS_COLORS.pending;
          const isResendable = inv.status === 'pending' || inv.status === 'expired';

          return (
            <div
              key={inv.id}
              style={{
                padding: '8px 10px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontSize: '12px',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500, color: '#333' }}>{inv.email}</span>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {inv.status}
                </span>
              </div>
              <div style={{ color: '#888', fontSize: '11px' }}>
                Sent {formatDate(inv.createdAt)}
                {inv.status === 'pending' ? ` · Expires ${formatDate(inv.expiresAt)}` : null}
                {inv.claimedAt ? ` · Claimed ${formatDate(inv.claimedAt)}` : null}
              </div>
              {isResendable && onResend ? (
                <button
                  type="button"
                  onClick={() => onResend(inv.email)}
                  style={{
                    marginTop: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    color: '#0070f3',
                    border: '1px solid #0070f3',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Resend
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
