import Head from 'next/head';
import Link from 'next/link';
import pb from '../lib/pocketbase';

export default function NotFoundPage() {

  return (
    <>
      <Head>
        <title>Page Not Found | Visual Asset Platform</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-6">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
              >
                Return to Homepage
              </Link>

              {pb.authStore.isValid && (
                <Link
                  href="/dashboard"
                  className="inline-block w-full px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium rounded-lg transition duration-200"
                >
                  Go to Your Dashboard
                </Link>
              )}
            </div>
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