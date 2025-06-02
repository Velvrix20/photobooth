'use client';

import { useAuth } from '@/app/context/AuthContext';
import React from 'react';
import withAuth from '@/app/components/auth/withAuth'; // Import the HOC

function AccountPageInternal() { // Renamed to avoid conflict, HOC will export default
  const { user, role, loading: authLoading } = useAuth(); // Renamed loading to avoid conflict if page had its own

  // The HOC handles the main loading and auth check,
  // but internal loading state can still be useful for content specific loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading account details...</p>
      </div>
    );
  }

  // User should be available here because withAuth handles the redirection
  // Adding a check for user to be safe, though HOC should prevent this state.
  if (!user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-500">Redirecting to login...</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">My Account</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="mb-4">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{user.email}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-gray-700 dark:text-gray-300">User ID:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100">{user.id}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">Role:</span>
          <span className="ml-2 text-gray-900 dark:text-gray-100 capitalize">
            {role || 'Not assigned'}
          </span>
        </div>
        {/* More account details can be added here */}
      </div>
    </div>
  );
}

export default withAuth(AccountPageInternal); // Wrap the component with HOC
