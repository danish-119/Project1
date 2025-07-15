'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import Link from 'next/link';


type Asset = {
    id: string;
    title: string;
    file: string;
    collectionId: string;
    created: string;
    description?: string;
    contributor?: string;
};

export default function GalleryPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const result = await pb.collection('assets').getList(1, 20, {
                    filter: 'is_premium = false',
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
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    const filteredAssets = assets.filter(asset =>
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Public Gallery | Visual Asset Platform</title>
                <meta name="description" content="Browse our collection of public visual assets" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Public Gallery</h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                        Discover and explore creative assets shared by our community
                    </p>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-8">
                    {/* Search*/}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Gallery Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : filteredAssets.length === 0 ? (
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
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No assets found</h3>
                            <p className="mt-1 text-gray-500">
                                {searchQuery ? 'Try a different search term' : 'No public assets available yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAssets.map((asset) => (
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