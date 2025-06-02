'use client';

import React from 'react';
import Link from 'next/link'; // Optional: for a link to login or homepage if needed

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <div className="max-w-md">
        <svg
          className="mx-auto mb-8 h-24 w-24 text-yellow-500 dark:text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Under Maintenance
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Our site is currently undergoing scheduled maintenance. We should be back online shortly.
          Thank you for your patience!
        </p>
        {/* Optional: Link to status page or contact email
        <Link href="/status" className="text-blue-500 hover:underline dark:text-blue-400">
          Check Status
        </Link>
        */}
        {/* Optional: A way for admins to try to log in if they are somehow seeing this page
         <div className="mt-8">
            <Link href="/login" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                Admin Login
            </Link>
        </div>
        */}
      </div>
    </div>
  );
}
