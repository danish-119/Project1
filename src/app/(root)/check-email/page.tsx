import Head from 'next/head';
import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <>
      <Head>
        <title>Verify Your Email | Visual Asset Platform</title>
        <meta name="description" content="Please verify your email address to continue" />
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h1>
            <p className="text-gray-600 mb-6">
              A verification link has been sent to your email address. Please check your inbox and click the link to verify your account.
            </p>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or
              </p>
              <Link
                href="/register"
                className="inline-block px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium rounded-lg transition duration-200"
              >
                Try Again
              </Link>
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