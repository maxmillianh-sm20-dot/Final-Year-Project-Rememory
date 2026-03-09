import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AppRoute } from '../types';
import { RememoryLogo } from '../components/RememoryLogo';
import { Footer } from '../components/Footer';

export const ResetPassword = () => {
    const { confirmPasswordReset, navigate } = useApp();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oobCode, setOobCode] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Extract oobCode from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('oobCode');
        if (code) {
            setOobCode(code);
        } else {
            setError('Invalid or missing reset code. Please try requesting a new password reset link.');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) return;

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await confirmPasswordReset(oobCode, newPassword);
            setMessage('Password has been reset successfully. Redirecting to login...');
            setTimeout(() => {
                navigate(AppRoute.LOGIN);
            }, 3000);
        } catch (err: any) {
            let errorMessage = 'Failed to reset password. Please try again.';
            if (err.code === 'auth/expired-action-code') {
                errorMessage = 'The password reset link has expired. Please request a new one.';
            } else if (err.code === 'auth/invalid-action-code') {
                errorMessage = 'The password reset link is invalid. Please request a new one.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else {
                errorMessage = err.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
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
                                Reset Password
                            </h1>
                            <p className="text-stone-500 text-sm">
                                Enter your new password below.
                            </p>
                        </div>

                        {message ? (
                            <div className="text-green-600 text-center bg-green-50 p-4 rounded-xl border border-green-200">
                                {message}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-xl border border-rose-200">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !oobCode}
                                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(AppRoute.LOGIN)}
                                        className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};
