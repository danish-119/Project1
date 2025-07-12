'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NavBar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(pb.authStore.isValid);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setLoggedIn(pb.authStore.isValid);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    router.push('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-4 bg-white shadow-sm">
        <Link 
          href="/" 
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Visual Asset Platform
        </Link>

        <div className="flex items-center space-x-6">
          {loggedIn ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/upload" 
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                Upload
              </Link>
              <Link 
                href="/account" 
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/gallery" 
                className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              >
                Gallery
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <Link 
          href="/" 
          className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          VAP
        </Link>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-gray-700 focus:outline-none"
        >
          <svg 
            className="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg px-4 pb-4">
          <div className="flex flex-col space-y-3">
            {loggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/upload" 
                  className="px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link 
                  href="/account" 
                  className="px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/gallery" 
                  className="px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gallery
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-center text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-center text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}