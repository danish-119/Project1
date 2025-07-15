// AllContributorsPage: Displays a grid of all contributor profiles with links to their public pages.
// Fetches data from PocketBase on load, shows a loader or empty state, and uses Tailwind for layout.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import Head from 'next/head';

type Contributor = {
  id: string;
  display_name: string;
  bio?: string;
};

export default function AllContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const result = await pb.collection('contributors').getFullList({ sort: 'display_name' });
        setContributors(
          result.map((item: any) => ({
            id: item.id,
            display_name: item.display_name,
            bio: item.bio,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch contributors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  return (
    <>
      <Head>
        <title>Contributors | Visual Asset Platform</title>
        <meta name="description" content="Browse all contributors and view their public profiles" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-10 text-center text-white">
          <h1 className="text-3xl font-bold">Contributors</h1>
          <p className="text-indigo-100 mt-2">Meet the amazing creators on our platform</p>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : contributors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No contributors found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {contributors.map((contributor) => (
                <Link
                  key={contributor.id}
                  href={`/contributors/${contributor.id}`}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all block"
                >
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                      {contributor.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {contributor.display_name}
                      </h2>
                      {contributor.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {contributor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-indigo-600 hover:underline mt-1">
                    View profile →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white py-6 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Visual Asset Platform. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
