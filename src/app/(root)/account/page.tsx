// AccountPage: Contributor account management page for the Visual Asset Platform.
// - Fetches or creates a contributor profile linked to the authenticated user.
// - Allows updating display name and bio.
// - Displays success/error feedback and handles loading state.
// - Uses AuthContext to access and refresh user identity data.

'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Head from 'next/head';
import { useAuth } from '../../components/context/AuthContext';

export default function AccountPage() {
  const [contributorId, setContributorId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, fetchUserData } = useAuth();

  // Fetch contributor record on user change
  useEffect(() => {
    const fetchContributor = async () => {
      try {
        const record = await pb
          .collection('contributors')
          .getFirstListItem(`user.id = "${user?.id}"`);
        setContributorId(record.id);
        setDisplayName(record.display_name);
        setBio(record.bio || '');
      } catch {
        // No contributor found — will create on save
      }
    };

    if (user?.id) {
      fetchContributor();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const data = {
      display_name: displayName,
      bio,
      user: user?.id,
    };

    try {
      if (contributorId) {
        await pb.collection('contributors').update(contributorId, data);
        setMessage('Profile updated successfully!');
        fetchUserData(); // Refresh user context
      } else {
        const created = await pb.collection('contributors').create(data);
        setContributorId(created.id);
        setMessage('Profile created successfully!');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error saving profile');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <>
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Saving...
    </>
  );

  return (
    <>
      <Head>
        <title>My Account | Visual Asset Platform</title>
        <meta name="description" content="Manage your account profile" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-start p-4 pt-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h1 className="mt-2 text-2xl font-bold text-white">My Account</h1>
            <p className="mt-1 text-indigo-100">
              Logged in as: <strong>{user?.email}</strong>
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none"
                />
              </div>

              {message && (
                <div
                  className={`rounded-md p-4 ${
                    message.includes('success')
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? <LoadingSpinner /> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Visual Asset Platform. All rights
            reserved.
          </p>
        </div>
      </div>
    </>
  );
}
