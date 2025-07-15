'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';

type Contributor = {
  id: string;
  user: string;
  display_name: string;
  bio?: string;
};

type Asset = {
  id: string;
  contributor: string;
  title: string;
  file: string;
  description?: string;
  created: string;
  is_premium: boolean;
};

export default function ContributorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Step 1: Get contributor profile by ID
        const contributorRecord = await pb.collection('contributors').getOne(id as string);
        setContributor({
          id: contributorRecord.id,
          display_name: contributorRecord.display_name,
          bio: contributorRecord.bio,
          user: contributorRecord.user,
        });

        // Step 2: Check if the current user is the contributor
        const currentUser = pb.authStore.model;
        if (currentUser?.id === contributorRecord.user) {
          setIsCurrentUser(true);
          return; // Redirect handled below
        }

        // Step 3: Get all public (non-premium) assets created by this contributor (by user ID)
        const assetRecords = await pb.collection('assets').getFullList({
          filter: `contributor="${contributorRecord.user}" && is_premium=false`,
          sort: '-created',
        });

        const typedAssets = assetRecords.map((r) => ({
          id: r.id,
          title: r.title,
          file: r.file,
          description: r.description,
          created: r.created,
          is_premium: r.is_premium,
          contributor: r.contributor,
        })) as Asset[];

        setAssets(typedAssets);
      } catch (err) {
        console.error('Error loading contributor or assets:', err);
        setError('Failed to load contributor profile or assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Redirect current user to dashboard
  useEffect(() => {
    if (isCurrentUser) {
      router.push('/dashboard');
    }
  }, [isCurrentUser, router]);

  return (
    <>
      <Head>
        <title>{contributor?.display_name || 'Contributor'} | Visual Asset Platform</title>
        <meta
          name="description"
          content={`Profile of ${contributor?.display_name || 'a contributor'}`}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-10 text-white text-center">
          <h1 className="text-3xl font-bold">
            {contributor?.display_name || 'Contributor Profile'}
          </h1>
          {contributor?.bio && (
            <p className="mt-2 text-indigo-100 max-w-2xl mx-auto">{contributor.bio}</p>
          )}
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-20">{error}</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-1 text-gray-500">
                This contributor hasn&apos;t shared any public assets yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`${pb.baseUrl}/api/files/assets/${asset.id}/${asset.file}?thumb=500x500`}
                      alt={asset.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm line-clamp-3">
                        {asset.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center mt-2">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {asset.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(asset.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
