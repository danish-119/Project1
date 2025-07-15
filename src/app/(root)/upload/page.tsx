'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import Head from 'next/head';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const records = await pb.collection('attributes').getFullList({ sort: 'name' });
        setAttributes(records);
      } catch (err) {
        console.error('Failed to fetch attributes', err);
      }
    };

    fetchAttributes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmittingRef.current) return;

    setMessage({ text: '', type: '' });
    setIsLoading(true);
    isSubmittingRef.current = true;

    const submitButton = formRef.current?.querySelector('button[type="submit"]');
    submitButton?.setAttribute('disabled', 'true');

    const contributorId = pb.authStore.model?.id;

    if (!contributorId) {
      setMessage({ text: 'You must be logged in to upload.', type: 'error' });
      cleanup();
      return;
    }

    if (!file) {
      setMessage({ text: 'Please select a file to upload.', type: 'error' });
      cleanup();
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('is_premium', isPremium.toString());
    formData.append('file', file);
    formData.append('contributor', contributorId);

    if (selectedAttributes.length > 0) {
      formData.append('asset_attributes', JSON.stringify(selectedAttributes));
    }

    try {
      await pb.collection('assets').create(formData);
      setMessage({ text: 'Asset uploaded successfully!', type: 'success' });
      resetForm();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('UPLOAD ERROR:', err);
      setMessage({ 
        text: err.response?.data?.message || err.message || 'Upload failed.', 
        type: 'error' 
      });
    } finally {
      cleanup();
    }
  };

  const cleanup = () => {
    setIsLoading(false);
    isSubmittingRef.current = false;
    formRef.current?.querySelector('button[type="submit"]')?.removeAttribute('disabled');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPreviewUrl(null);
    setSelectedAttributes([]);
  };

  useEffect(() => {
    return () => {
      isSubmittingRef.current = false;
    };
  }, []);

  const LoadingSpinner = () => (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Uploading...
    </>
  );

  return (
    <>
      <Head>
        <title>Upload Asset | Visual Asset Platform</title>
        <meta name="description" content="Upload your visual assets to share with the community" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-start p-4 pt-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h1 className="mt-2 text-2xl font-bold text-white">Upload Visual Asset</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            <form ref={formRef} onSubmit={handleUpload} className="space-y-6">
              {/* File Upload Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Visual Asset *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative group">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="mx-auto max-h-60 rounded-lg object-contain shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                          <label className="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm transition-opacity cursor-pointer">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Give your asset a descriptive title"
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
                  placeholder="Tell us about your asset (optional)"
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
                        value={attr.id}
                        checked={selectedAttributes.includes(attr.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttributes([...selectedAttributes, attr.id]);
                          } else {
                            setSelectedAttributes(selectedAttributes.filter(id => id !== attr.id));
                          }
                        }}
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
                  <p className="text-gray-500">Only available to premium members</p>
                </div>
              </div>

              {/* Message */}
              {message.text && (
                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? <LoadingSpinner /> : 'Upload Asset'}
                </button>
              </div>
            </form>
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