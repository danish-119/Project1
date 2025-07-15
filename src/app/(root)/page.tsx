'use client';

import Head from 'next/head';
import Link from 'next/link';
import pb from '@/lib/pocketbase';

export default function LandingPage() {
  const isLoggedIn = pb.authStore.isValid;

  return (
    <>
      <Head>
        <title>Visual Asset Platform | Share & Discover Creative Assets</title>
        <meta name="description" content="A platform for creators to share and discover visual assets. Upload your work, browse premium content, and connect with other creatives." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Share Your Creativity With The World</h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8">
                A beautiful platform for creators to showcase, discover, and share visual assets.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isLoggedIn ? (
                  <Link 
                    href="/dashboard" 
                    className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-center"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/register" 
                      className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-center"
                    >
                      Get Started
                    </Link>
                    <Link 
                      href="/gallery" 
                      className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors text-center"
                    >
                      Browse Gallery
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Our Platform</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Upload</h3>
                <p className="text-gray-600">
                  Quickly upload your visual assets with our intuitive interface. Add titles, descriptions, and tags to make your work discoverable.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover Content</h3>
                <p className="text-gray-600">
                  Browse thousands of creative assets from our community.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Platform</h3>
                <p className="text-gray-600">
                  Your assets are safe with us. Robust authentication and permission systems ensure only authorized access.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="py-16 md:py-24 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Work?</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              Join our growing community of creators today. It's free to get started!
            </p>
            <Link 
              href={isLoggedIn ? "/upload" : "/register"} 
              className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              {isLoggedIn ? 'Upload Your First Asset' : 'Create Your Account'}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white py-8 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Visual Asset Platform
                </Link>
              </div>
              <div className="flex space-x-6">
                <Link href="/about" className="text-gray-600 hover:text-indigo-600">About</Link>
                <Link href="/gallery" className="text-gray-600 hover:text-indigo-600">Gallery</Link>
                <Link href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
                <Link href="/privacy" className="text-gray-600 hover:text-indigo-600">Privacy</Link>
              </div>
            </div>
            <div className="mt-6 text-center md:text-left text-sm text-gray-500">
              © {new Date().getFullYear()} Visual Asset Platform. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}