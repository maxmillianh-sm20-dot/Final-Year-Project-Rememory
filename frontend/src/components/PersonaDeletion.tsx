import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@context/AuthContext';
import { apiClient } from '@services/apiService';

interface PersonaDeletionProps {
  personaId: string;
  personaName: string;
}

const CONFIRMATION_SENTENCE = 'I understand this will permanently delete my persona and messages.';

export const PersonaDeletion = ({ personaId, personaName }: PersonaDeletionProps) => {
  const { token, refreshPersona } = useAuth();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!token) {
      setError('You must be logged in to delete a persona');
      return;
    }

    if (confirmation !== CONFIRMATION_SENTENCE) {
      setError('Confirmation text does not match. Please type the exact sentence.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/persona/${personaId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { confirmation }
      });

      await refreshPersona();
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete persona';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <div style={{
        padding: '1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <h3 style={{ color: '#fca5a5', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
          Delete Persona
        </h3>
        <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
          This action cannot be undone. All conversations with {personaName} will be permanently deleted.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          I want to delete this persona
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(239, 68, 68, 0.15)',
      borderRadius: '8px',
      border: '2px solid rgba(239, 68, 68, 0.4)'
    }}>
      <h3 style={{ color: '#fca5a5', marginTop: 0, marginBottom: '1rem' }}>
        Confirm Permanent Deletion
      </h3>

      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <p style={{ color: '#e2e8f0', margin: '0 0 0.75rem 0', fontWeight: '500' }}>
          To confirm deletion, please type the following sentence exactly:
        </p>
        <p style={{
          color: '#38bdf8',
          fontFamily: 'monospace',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '0.75rem',
          borderRadius: '4px',
          margin: 0,
          fontSize: '0.875rem'
        }}>
          {CONFIRMATION_SENTENCE}
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#fca5a5',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <textarea
        value={confirmation}
        onChange={(e) => {
          setConfirmation(e.target.value);
          setError(null);
        }}
        placeholder="Type the confirmation sentence here..."
        style={{
          width: '100%',
          minHeight: '100px',
          padding: '0.75rem',
          background: 'rgba(15, 23, 42, 0.8)',
          border: confirmation === CONFIRMATION_SENTENCE
            ? '2px solid #10b981'
            : '2px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '6px',
          color: '#e2e8f0',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: '1rem'
        }}
      />

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || confirmation !== CONFIRMATION_SENTENCE}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading || confirmation !== CONFIRMATION_SENTENCE
              ? '#475569'
              : '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || confirmation !== CONFIRMATION_SENTENCE
              ? 'not-allowed'
              : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Deleting...' : 'Permanently Delete'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmation('');
            setError(null);
          }}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(148, 163, 184, 0.2)',
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Cancel
        </button>
      </div>

      <p style={{
        color: '#fca5a5',
        fontSize: '0.75rem',
        marginTop: '1rem',
        marginBottom: 0,
        fontStyle: 'italic'
      }}>
        ⚠️ This action is irreversible. All data will be permanently removed from our servers.
      </p>
    </div>
  );
};

