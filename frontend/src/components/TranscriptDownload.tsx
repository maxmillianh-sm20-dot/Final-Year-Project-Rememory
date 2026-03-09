import { useState } from 'react';

import { useAuth } from '@context/AuthContext';
import { fetchMessages } from '@services/apiService';

interface TranscriptDownloadProps {
  personaId: string;
  personaName: string;
}

export const TranscriptDownload = ({ personaId, personaName }: TranscriptDownloadProps) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTranscript = async (format: 'txt' | 'csv') => {
    if (!token) {
      setError('You must be logged in to download transcripts');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messages = await fetchMessages(personaId, token);
      
      if (messages.length === 0) {
        setError('No messages to download');
        setLoading(false);
        return;
      }

      let content = '';
      let filename = '';

      if (format === 'txt') {
        content = `Rememory Conversation Transcript\n`;
        content += `Persona: ${personaName}\n`;
        content += `Generated: ${new Date().toLocaleString()}\n`;
        content += `\n${'='.repeat(50)}\n\n`;
        
        messages.forEach((msg) => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          const sender = msg.sender === 'ai' ? personaName : msg.sender === 'user' ? 'You' : 'System';
          content += `[${timestamp}] ${sender}:\n${msg.text}\n\n`;
        });

        filename = `rememory-${personaName}-${Date.now()}.txt`;
      } else {
        // CSV format
        content = 'Timestamp,Sender,Message\n';
        messages.forEach((msg) => {
          const timestamp = new Date(msg.timestamp).toISOString();
          const sender = msg.sender === 'ai' ? personaName : msg.sender === 'user' ? 'You' : 'System';
          const text = `"${msg.text.replace(/"/g, '""')}"`;
          content += `${timestamp},${sender},${text}\n`;
        });

        filename = `rememory-${personaName}-${Date.now()}.csv`;
      }

      // Create and download file
      const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download transcript';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '8px',
      border: '1px solid rgba(148, 163, 184, 0.2)'
    }}>
      <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
        Download Conversation Transcript
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Save your conversations with {personaName} before the session ends.
      </p>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => downloadTranscript('txt')}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#475569' : '#38bdf8',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Preparing...' : 'Download as TXT'}
        </button>
        <button
          type="button"
          onClick={() => downloadTranscript('csv')}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: loading ? '#475569' : 'rgba(56, 189, 248, 0.2)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Preparing...' : 'Download as CSV'}
        </button>
      </div>
    </div>
  );
};

