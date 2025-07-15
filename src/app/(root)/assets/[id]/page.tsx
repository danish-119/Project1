'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import type { RecordModel } from 'pocketbase';

type Attribute = {
    name: string;
};

type Contributor = {
    id: string;
    display_name: string;
    bio?: string;
};

type Asset = RecordModel & {
    title: string;
    description?: string;
    file: string;
    created: string;
    collectionId: string;
    expand?: {
        contributor?: Contributor;
        asset_attributes?: Attribute[];
    };
};

export default function AssetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [contributorId, setContributorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchAsset = async () => {
            try {
                const record = await pb.collection('assets').getOne(id as string, {
                    expand: 'contributor,asset_attributes',
                });

                let contributorData: Contributor | null = null;

                if (record.contributor) {
                    const contributorProfile = await pb
                        .collection('contributors')
                        .getFirstListItem(`user="${record.contributor}"`);
                    contributorData = {
                        id: contributorProfile.id,
                        display_name: contributorProfile.display_name,
                        bio: contributorProfile.bio,
                    };
                    setContributorId(contributorProfile.id);
                }

                const typedAsset = record as Asset;
                setAsset({
                    ...typedAsset,
                    expand: {
                        ...typedAsset.expand,
                        contributor: contributorData || undefined,
                    },
                });
            } catch (err) {
                console.error('Failed to fetch asset or contributor:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id]);

    // ✅ Navigate to public contributor profile
    const handleContributorClick = () => {
        if (contributorId) {
            router.push(`/contributors/${contributorId}`);
        }
    };

    return (
        <>
            <Head>
                <title>{asset?.title || 'Asset'} | Visual Asset Platform</title>
                <meta name="description" content={asset?.description || 'View full details of this visual asset'} />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-6 text-white">
                    <div className="container mx-auto px-4">
                        <h1 className="text-2xl font-bold">Asset Details</h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : asset ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-gray-100">
                                {imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                )}
                                <img
                                    src={`${pb.baseUrl}/api/files/${asset.collectionId}/${asset.id}/${asset.file}?thumb=800x600`}
                                    alt={asset.title}
                                    className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    onLoad={() => setImageLoading(false)}
                                />
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <h1 className="text-xl font-bold text-gray-800 mb-2">{asset.title}</h1>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {asset.description || 'No description provided.'}
                                        </p>

                                        {(asset.expand?.asset_attributes?.length ?? 0) > 0 && (
                                            <div className="mb-4">
                                                <h3 className="text-xs font-semibold text-gray-700 mb-2">TAGS</h3>
                                                <ul className="flex flex-wrap gap-1">
                                                    {asset.expand?.asset_attributes?.map((attr, idx) => (
                                                        <li key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full font-medium">
                                                            {attr.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-400">
                                            Uploaded{' '}
                                            {new Date(asset.created).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    {/* Contributor Box */}
                                    <div
                                        className="sm:w-48 flex-shrink-0 cursor-pointer"
                                        onClick={handleContributorClick}
                                    >
                                        <div className="bg-gray-50 rounded-md p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Contributor</h3>
                                            {asset.expand?.contributor ? (
                                                <>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {asset.expand.contributor.display_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium">{asset.expand.contributor.display_name}</span>
                                                    </div>
                                                    {asset.expand.contributor.bio && (
                                                        <p className="text-gray-600 text-xs line-clamp-2">{asset.expand.contributor.bio}</p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-400 text-xs italic">Unknown contributor</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-md font-medium text-gray-900">Asset not found</h3>
                            <p className="mt-1 text-sm text-gray-500">The requested asset is unavailable.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
