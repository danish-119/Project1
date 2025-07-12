import Head from 'next/head';
import Link from 'next/link';

export default function TemplatePage() {
  return (
    <>
      <Head>
        <title>Account | Visual Asset Platform</title>
        <meta name="description" content="Page description" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Decorative header - customize icon and title */}
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
                d="M13 10V3L4 14h7v7l9-11h-7z" // Lightning bolt icon - replace with appropriate icon
              />
            </svg>
            <h2 className="mt-2 text-2xl font-bold text-white">Account Page</h2>
          </div>

          {/* Main content area - customize this section */}
          <div className="p-8">
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident sunt totam eos non repudiandae voluptatibus, sit velit ipsam magnam maiores praesentium. Velit, quam! Accusamus quas facilis optio exercitationem, dicta eum excepturi, pariatur expedita consectetur sit beatae unde velit ipsam ad deleniti, asperiores voluptates soluta provident? Aperiam quam eaque illo vitae similique? Distinctio quisquam temporibus quos.
            </p>
          </div>
        </div>

        {/* Consistent footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Visual Asset Platform. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}