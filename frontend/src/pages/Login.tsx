import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute } from '../types';
import { RememoryLogo } from '../components/RememoryLogo';
import { Disclaimer } from '../components/Disclaimer';

export const Login = () => {
  const { navigate, state, login, loginWithGoogle, currentRoute, reloadPersona, loading, resetPassword } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(state.userEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Redirect after login - check if persona exists
  useEffect(() => {
    // Only redirect if we're on LOGIN page, authenticated, not loading, and login process completed
    if (currentRoute === AppRoute.LOGIN && state.isAuthenticated && !loading && isLoggingIn) {
      // Wait for persona state to stabilize after loading completes
      const timer = setTimeout(() => {
        // Double-check we're still on LOGIN page before redirecting
        if (currentRoute === AppRoute.LOGIN) {
          if (state.persona && state.hasOnboarded) {
            // User has persona, go to dashboard
            navigate(AppRoute.DASHBOARD);
            setIsLoggingIn(false);
          } else if (!loading) {
            // No persona yet (and not loading), go to setup to create one
            navigate(AppRoute.SETUP);
            setIsLoggingIn(false);
          }
        }
      }, 1500); // Give enough time for persona to load
      return () => clearTimeout(timer);
    }
  }, [currentRoute, state.isAuthenticated, state.persona, state.hasOnboarded, loading, isLoggingIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      setError('All fields are required.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setIsLoggingIn(false); // Reset first
    try {
      // Login/signup and load persona
      await login(email.trim(), password, isSignup);
      // Only set isLoggingIn to true after successful login
      setIsLoggingIn(true);
      // useEffect will handle redirect after persona loads
    } catch (err: any) {
      // Handle Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';

      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Please sign in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(false); // Reset first
    try {
      // Login and load persona
      await loginWithGoogle();
      // Only set isLoggingIn to true after successful login
      setIsLoggingIn(true);
      // useEffect will handle redirect after persona loads
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setResetMessage('');

    try {
      await resetPassword(email.trim());
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-stone-50">
      {/* Header with Logo */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <RememoryLogo />
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-stone-800 mb-2">
                {isForgotPassword
                  ? 'Reset Password'
                  : (isSignup ? 'Create an account' : 'Welcome back')}
              </h1>
              <p className="text-stone-500 text-sm">
                {isForgotPassword
                  ? 'Enter your email to receive a password reset link.'
                  : (isSignup
                    ? 'Start your journey by creating a personal space.'
                    : 'Log in to continue your remembrance journey.')}
              </p>
            </div>

            {/* Google Login Button - Hidden in forgot password mode */}
            {!isForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-50 transition-all mb-6"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-stone-500">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            {/* Email/Password Form */}
            {isForgotPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {error}
                  </div>
                )}

                {resetMessage && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200">
                    {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md"
                >
                  Send Reset Link
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError('');
                      setResetMessage('');
                    }}
                    className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isLoggingIn}
                  className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(loading || isLoggingIn) && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {isSignup ? 'Sign Up' : 'Log In'}
                </button>
              </form>
            )}

            {/* Toggle Signup/Login */}
            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                  className="text-sm text-stone-500 hover:text-stone-800 underline transition-colors"
                >
                  {isSignup
                    ? 'Already have an account? Log in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
};

