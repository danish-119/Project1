// NavBar: Responsive navigation bar with conditional links based on authentication.
// Displays "Gallery", "Dashboard", "Upload", and "Account" links for logged-in users,
// and "Login"/"Register" buttons for guests. Shows user avatar or initials from userData.
// Includes mobile toggle menu with the same functionality. Uses PocketBase auth state from context.

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import { useAuth } from './context/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userData, logout, user } = useAuth();

  
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const handleLogout = async () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Visual Asset Platform
          </Link>

          <Link
            href="/gallery"
            className={`text-gray-700 hover:text-indigo-600 transition-colors font-medium ${
              isActive('/gallery') ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Gallery
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-gray-700 hover:text-indigo-600 transition-colors font-medium ${
                  isActive('/dashboard') ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`text-gray-700 hover:text-indigo-600 transition-colors font-medium ${
                  isActive('/upload') ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Upload
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                {userData?.avatar ? (
                  <img
                    src={`${pb.baseUrl}/api/files/contributors/${user?.id}/${userData.avatar}?thumb=40x40`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-semibold">
                    {userData?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-gray-700 font-medium hidden md:inline">
                  {userData?.displayName || 'Account'}
                </span>
              </button>
              <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible">
                <Link
                  href="/account"
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg ${
                  isActive('/login')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                } transition-colors`}
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
      <nav className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-50">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          VAP
        </Link>

        <div className="flex items-center space-x-4">
          {user && userData && (
            <div className="relative">
              {userData.avatar ? (
                <img
                  src={`${pb.baseUrl}/api/files/contributors/${user?.id}/${userData.avatar}?thumb=40x40`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-semibold">
                  {userData.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          )}

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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg px-4 pb-4 fixed w-full z-40">
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              href="/gallery"
              className={`px-4 py-2 rounded-lg ${
                isActive('/gallery') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg ${
                    isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className={`px-4 py-2 rounded-lg ${
                    isActive('/upload') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/account"
                  className={`px-4 py-2 rounded-lg ${
                    isActive('/account') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
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
                  href="/login"
                  className={`px-4 py-2 rounded-lg text-center ${
                    isActive('/login')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-center text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-sm"
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
