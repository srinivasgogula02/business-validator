'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginClient() {
    const router = useRouter();
    const [isMobileLogin, setIsMobileLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Mobile State
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const supabase = createClient();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

            setOtpSent(true);
            setMessage({ text: 'OTP sent successfully', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Verification failed');

            setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
            router.refresh(); // Refresh server components
            router.push('/chat'); // Redirect to chat
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;

                if (data.session) {
                    setMessage({ text: 'Sign up successful! Redirecting...', type: 'success' });
                    router.refresh();
                    router.push('/chat');
                } else {
                    setMessage({ text: 'Check your email for confirmation link.', type: 'success' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                router.refresh();
                router.push('/chat');
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your venture validator
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg bg-secondary p-1">
                    <button
                        onClick={() => setIsMobileLogin(true)}
                        className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${isMobileLogin
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-primary'
                            }`}
                    >
                        Mobile
                    </button>
                    <button
                        onClick={() => setIsMobileLogin(false)}
                        className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${!isMobileLogin
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-primary'
                            }`}
                    >
                        Email
                    </button>
                </div>

                {message && (
                    <div className={`rounded-md p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                {isMobileLogin ? (
                    /* Mobile Login Form */
                    <div className="space-y-6">
                        {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                        Mobile Number
                                    </label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">🇮🇳 +91</span>
                                        </div>
                                        <input
                                            id="mobile"
                                            name="mobile"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="block w-full rounded-md border-gray-300 pl-16 py-3 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 border"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || mobile.length < 10}
                                    className="flex w-full justify-center rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                        Enter OTP
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        autoComplete="one-time-code"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="mt-1 block w-full rounded-md border-gray-300 py-3 px-3 text-center text-2xl tracking-[0.5em] text-gray-900 shadow-sm focus:border-primary focus:ring-primary bg-gray-50 border"
                                        placeholder="······"
                                    />
                                    <div className="mt-2 flex justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-primary hover:text-primary/80 font-medium"
                                        >
                                            Change Number
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isLoading}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="flex w-full justify-center rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    /* Email Login Form */
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-3 px-3 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 border"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 py-3 px-3 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-gray-50 border"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                        <div className="text-center text-sm">
                            <span className="text-gray-500">
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-semibold text-primary hover:text-primary/80"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
