// AuthContext: Provides global authentication state and methods using PocketBase.
// Handles login, logout, user persistence via cookies, and user data fetching from the "contributors" collection.
// Exposes `user`, `userData`, `isAuthLoading`, and auth methods via React context.
// Used by wrapping the app with `AuthProvider` and accessing with `useAuth()` in components.

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: RecordModel | null;
    login: (email: string, password: string) => Promise<string | void>;
    logout: () => void;
    fetchUser: () => void;
    userData: any;
    fetchUserData: () => void;
    isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<RecordModel | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
        } else {
            setUserData(null);
        }
    }, [user]);

    const fetchUser = async () => {
        if (pb.authStore.isValid) {
            setUser(pb.authStore.model);
        } else {
            setUser(null);
        }
        setIsAuthLoading(false);
    };

    const fetchUserData = async () => {
        try {
            if (user) {
                const contributor = await pb
                    .collection('contributors')
                    .getFirstListItem(`user = "${user.id}"`);
                setUserData({
                    email: user.email,
                    displayName: contributor.display_name,
                    avatar: contributor.avatar || null,
                });
            }
        } catch (err: any) {
            if (err.status === 404) {
                console.warn('No contributor profile found for user:', user?.id);
            } else {
                console.error('Failed to fetch user data:', err);
            }
            setUserData(null);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await pb.collection('users').authWithPassword(email, password);

            document.cookie = pb.authStore.exportToCookie({
                httpOnly: false,
                secure: true,
                sameSite: 'Lax',
                path: '/',          // Required for Vercel middleware to access
            });

            await fetchUser();
            await fetchUserData();

            router.push('/dashboard');



            console.log('User logged in:', pb.authStore.model);
            router.push('/dashboard');
            console.log('Redirecting to dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            return err.message || 'Login failed';
        }
    };

    const logout = () => {
        pb.authStore.clear();
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
        router.push('/');
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, fetchUser, userData, fetchUserData, isAuthLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
