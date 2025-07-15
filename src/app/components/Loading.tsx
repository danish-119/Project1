// Loading: A full-screen animated loading screen used during data fetching or navigation delays.
// Includes a spinning icon, animated text dots, and a progress bar to enhance user experience.

import React from 'react'

const Loading = () => {
  return (
     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Animated logo/spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-purple-600 animate-spin"></div>
          <svg
            className="absolute inset-2 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
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
        </div>

        {/* Loading text with subtle animation */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Loading your experience
            <span className="inline-block ml-1 animate-pulse">
              <span>.</span>
              <span className="animation-delay-150">.</span>
              <span className="animation-delay-300">.</span>
            </span>
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Just a moment while we prepare your personalized dashboard
          </p>
        </div>

        {/* Progress indicator (optional) */}
        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  )
}

export default Loading;