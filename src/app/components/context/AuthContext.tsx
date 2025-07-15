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
      const authData = await pb.collection('users').authWithPassword(email, password);

      const cookieValue = JSON.stringify({
        token: pb.authStore.token,
        model: pb.authStore.model,
      });

      document.cookie = `pb_auth=${cookieValue}; path=/; SameSite=Lax; ${
        location.protocol === 'https:' ? 'Secure;' : ''
      }`;

      fetchUser();
      fetchUserData();

      console.log('User logged in:', authData.record);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      return err.message || 'Login failed';
    }
  };

  const logout = () => {
    pb.authStore.clear();
    document.cookie = `pb_auth=; path=/; Max-Age=0;`;
    router.push('/');
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, fetchUser, userData, fetchUserData, isAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
