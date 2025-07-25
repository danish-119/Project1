// RegisterPage: A client-side registration form for creating a new user using PocketBase.
// The form collects email, password, and password confirmation.
// It validates input (password length and match), clears field-specific errors on change,
// submits data to PocketBase, handles server-side validation errors (e.g., duplicate email),
// and redirects to /check-email on success. A loading spinner is shown during submission.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (password !== passwordConfirm) {
            newErrors.passwordConfirm = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            pb.authStore.clear();
            await pb.collection('users').create({
                email,
                password,
                passwordConfirm,
            });
            await pb.collection('users').requestVerification(email);
            
            router.push('/check-email');
        } catch (err: any) {
            console.error('Registration error:', err);

            const newErrors: Record<string, string> = {};

            if (err?.response?.data) {
                Object.entries(err.response.data).forEach(([field, error]: [string, any]) => {
                    if (field === 'email') {
                        newErrors.email = error.message.includes('unique')
                            ? 'An account with this email already exists'
                            : error.message;
                    } else if (field === 'password') {
                        newErrors.password = error.message;
                    } else {
                        newErrors.general = error.message;
                    }
                });
            } else {
                newErrors.general = err.message || 'Registration failed. Please try again.';
            }

            setErrors(newErrors);
        } finally {
            setIsLoading(false);
        }
    };

    const LoadingSpinner = () => (
        <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
        </>
    );

    return (
        <>
            <Head>
                <title>Register | Visual Asset Platform</title>
                <meta name="description" content="Create your account to start sharing visual assets" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden mx-auto">
                    {/* Decorative header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                        <h2 className="mt-2 text-2xl font-bold text-white">Create Your Account</h2>
                        <p className="mt-1 text-indigo-100">
                            Already have an account?{' '}
                            <a href="/login" className="font-semibold hover:text-white transition-colors">
                                Sign in
                            </a>
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {errors.general && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Registration error
                                        </h3>
                                        <div className="mt-1 text-sm text-red-700">
                                            <p>{errors.general}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        clearError('email');
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        clearError('password');
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type="password"
                                    required
                                    value={passwordConfirm}
                                    onChange={(e) => {
                                        setPasswordConfirm(e.target.value);
                                        clearError('passwordConfirm');
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.passwordConfirm ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none`}
                                />
                                {errors.passwordConfirm && (
                                    <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? <LoadingSpinner /> : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Visual Asset Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}