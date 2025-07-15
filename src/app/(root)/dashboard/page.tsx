// DashboardPage: Authenticated user's personal dashboard to manage uploaded assets.
// - Redirects to /login if not authenticated.
// - Fetches all assets uploaded by the currently logged-in contributor.
// - Displays each asset with preview, title, date, and premium badge (if applicable).
// - Allows editing or deleting individual assets.
// - Includes confirmation modal before deletion.
// - Responsive grid layout with graceful loading and empty states.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../components/context/AuthContext';

type Asset = {
  id: string;
  title: string;
  description: string;
  is_premium: boolean;
  file: string;
  collectionId: string;
  created: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAssets = async () => {
      try {
        setLoading(true);
        const result = await pb.collection('assets').getFullList({
          filter: `contributor.id = "${user.id}"`,
          sort: '-created',
        });

        setAssets(result.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          is_premium: item.is_premium,
          file: item.file,
          collectionId: item.collectionId,
          created: item.created,
        })));
      } catch (err) {
        console.error('Failed to fetch assets', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [user, router]);


  const handleDelete = async (id: string) => {
    try {
      await pb.collection('assets').delete(id);
      setAssets(assets.filter(asset => asset.id !== id));
    } catch (err) {
      console.error('Failed to delete asset', err);
    } finally {
      setShowDeleteModal(false);
      setAssetToDelete(null);
    }
  };

  return (
    <>
      <Head>
        <title>My Dashboard | Visual Asset Platform</title>
        <meta name="description" content="Manage your visual assets portfolio" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-8 text-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>
              <Link
                href="/upload"
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Upload New
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
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
              <h3 className="mt-2 text-lg font-medium text-gray-900">No assets yet</h3>
              <p className="mt-1 text-gray-500">Get started by uploading your first asset</p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
                >
                  Upload Asset
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={`${pb.baseUrl}/api/files/${asset.collectionId}/${asset.id}/${asset.file}?thumb=500x500`}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    {asset.is_premium && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{asset.title}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(asset.created).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{asset.description}</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Link
                        href={`/dashboard/edit/${asset.id}`}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setAssetToDelete(asset.id);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900">Delete Asset</h3>
              <p className="mt-2 text-gray-600">Are you sure you want to delete this asset? This action cannot be undone.</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAssetToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => assetToDelete && handleDelete(assetToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}