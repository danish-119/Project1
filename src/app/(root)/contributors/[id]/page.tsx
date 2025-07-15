'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import Link from 'next/link';

type Contributor = {
  id: string;
  user: string;
  display_name: string;
  bio?: string;
};

type Asset = {
  id: string;
  title: string;
  file: string;
  collectionId: string;
  created: string;
  description?: string;
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
        // Fetch contributor with expanded user relation
        const contributorRecord = await pb.collection('contributors').getOne(id as string, {
          expand: 'user',
        });

       
        const userId = contributorRecord.expand?.user?.id;
        const currentUserId = pb.authStore.model?.id;

         console.log('Contributor Record:', contributorRecord);
         console.log('User ID:', userId);
         console.log('Current User ID:', currentUserId);

        setContributor({
          id: contributorRecord.id,
          display_name: contributorRecord.display_name,
          bio: contributorRecord.bio,
          user: userId,
        });

        // Redirect if user is viewing their own profile
        if (currentUserId === userId) {
          setIsCurrentUser(true);
          return;
        }

        // Fetch assets where contributor=userId AND is_premium=false
        const result = await pb.collection('assets').getList(1, 50, {
          filter: `contributor="${userId}" && is_premium=false`,
          sort: '-created',
        });

        const mappedAssets: Asset[] = result.items.map((item) => ({
          id: item.id,
          title: item.title,
          file: item.file,
          collectionId: item.collectionId,
          created: item.created,
          description: item.description,
        }));

        setAssets(mappedAssets);
      } catch (err) {
        console.error('❌ Error loading contributor or assets:', err);
        setError('Failed to load contributor profile or assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (isCurrentUser) {
      router.push('/dashboard');
    }
  }, [isCurrentUser, router]);

  return (
    <>
      <Head>
        <title>{contributor?.display_name || 'Contributor'} | Visual Asset Platform</title>
        <meta name="description" content={`Profile of ${contributor?.display_name || 'a contributor'}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-10 text-white text-center">
          <h1 className="text-3xl font-bold">{contributor?.display_name || 'Contributor Profile'}</h1>
          {contributor?.bio && (
            <p className="mt-2 text-indigo-100 max-w-2xl mx-auto">{contributor.bio}</p>
          )}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-20">{error}</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">This contributor hasn't shared any public assets yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`${pb.baseUrl}/api/files/${asset.collectionId}/${asset.id}/${asset.file}?thumb=500x500`}
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
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{asset.title}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(asset.created).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
