import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@context/AuthContext';
import { auth } from '@services/firebaseService';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up - use backend endpoint which creates Firebase user
        if (password.length < 10) {
          setError('Password must be at least 10 characters long');
          setLoading(false);
          return;
        }

        try {
          // Try proxy first, fallback to direct URL
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
          const signupUrl = `/api/auth/signup`;  // Use Vite proxy
          
          const response = await fetch(signupUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              displayName: displayName || undefined
            })
          });

          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response received:', text.substring(0, 200));
            throw new Error(`Server error: Received HTML instead of JSON. Status: ${response.status}. Make sure the backend is running on port 4000.`);
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create user account');
          }

          // After backend creates user, sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          setUser(userCredential.user);
          navigate('/');
        } catch (err: unknown) {
          console.error('Signup error:', err);
          
          // Handle network errors
          if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
            throw new Error(`Cannot connect to server at ${apiBaseUrl}. Please:\n1. Make sure the backend is running (cd backend && yarn dev)\n2. Restart the frontend dev server (cd frontend && yarn dev)\n3. Check that port 4000 is not blocked by firewall`);
          }
          
          // If backend signup fails, try Firebase Auth directly as fallback
          if (err instanceof Error && err.message.includes('Failed to create')) {
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              setUser(userCredential.user);
              navigate('/');
            } catch (firebaseError) {
              throw err; // Throw original backend error
            }
          } else {
            throw err;
          }
        }
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        navigate('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.8)', 
        padding: '2rem', 
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          {isSignUp ? 'Create Account' : 'Welcome to Rememory'}
        </h1>
        
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          {isSignUp 
            ? 'Create an account to begin your journey' 
            : 'Sign in to continue your conversations'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="displayName" style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                Display Name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Your name"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '4px',
                color: '#e2e8f0',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#e2e8f0' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 10 : undefined}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '4px',
                color: '#e2e8f0',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder={isSignUp ? "At least 10 characters" : "Your password"}
            />
            {isSignUp && (
              <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                Password must be at least 10 characters
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#475569' : '#38bdf8',
              color: '#0f172a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(30, 41, 59, 0.5)', 
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: '#94a3b8',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Note:</strong> Rememory is a supportive simulation. 
          Always remember that AI personas are not the real individual.
        </p>
      </div>
    </main>
  );
};

