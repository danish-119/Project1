// EditAssetPage: Allows authenticated contributors to edit metadata of an existing uploaded asset.
// - Redirects to /login if unauthenticated.
// - Fetches asset details and all available attributes on mount.
// - Supports editing title, description, premium status, and assigned attributes.
// - Displays current asset file (non-editable) with guidance to re-upload for file changes.
// - Provides form validation, success/error feedback, and automatic redirection on update.

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../../components/context/AuthContext';

type Attribute = {
  id: string;
  name: string;
};

type Asset = {
  id: string;
  title: string;
  description: string;
  is_premium: boolean;
  file: string;
  collectionId: string;
  asset_attributes?: string[];
  expand?: {
    asset_attributes?: Attribute[];
  };
};

export default function EditAssetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch asset data
        const assetData = await pb.collection('assets').getOne(id as string, {
          expand: 'asset_attributes'
        });
        setAsset(assetData as unknown as Asset);
        setTitle(assetData.title);
        setDescription(assetData.description);
        setIsPremium(assetData.is_premium);
        setSelectedAttributes(assetData.asset_attributes || []);

        // Fetch all available attributes
        const attrData = await pb.collection('attributes').getFullList();
        setAttributes(
          attrData.map((attr: any) => ({
            id: attr.id,
            name: attr.name
          }))
        );
      } catch (err) {
        console.error('Failed to fetch data', err);
        setMessage({ text: 'Failed to load asset data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const updatedData = {
        title,
        description,
        is_premium: isPremium,
        asset_attributes: selectedAttributes
      };

      await pb.collection('assets').update(id as string, updatedData);
      setMessage({ text: 'Asset updated successfully!', type: 'success' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      console.error('Update error:', err);
      setMessage({ 
        text: err.response?.data?.message || err.message || 'Update failed', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAttribute = (attrId: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attrId)
        ? prev.filter(id => id !== attrId)
        : [...prev, attrId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Asset not found</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit {asset.title} | Visual Asset Platform</title>
        <meta name="description" content={`Edit ${asset.title} asset details`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-8 text-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">Edit Asset</h1>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Asset</label>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`${pb.baseUrl}/api/files/${asset.collectionId}/${asset.id}/${asset.file}`}
                      alt={asset.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Note: To change the file, you'll need to delete and re-upload this asset.</p>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none"
                  />
                </div>

                {/* Attributes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attributes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.map((attr) => (
                      <div key={attr.id} className="flex items-center">
                        <input
                          id={`attr-${attr.id}`}
                          type="checkbox"
                          checked={selectedAttributes.includes(attr.id)}
                          onChange={() => toggleAttribute(attr.id)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`attr-${attr.id}`} className="ml-2 text-sm text-gray-700">
                          {attr.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="premium"
                      name="premium"
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="premium" className="font-medium text-gray-700">
                      Premium Asset
                    </label>
                    <p className="text-gray-500">Mark this as a premium asset (only available to premium members)</p>
                  </div>
                </div>

                {/* Message */}
                {message.text && (
                  <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Update Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}