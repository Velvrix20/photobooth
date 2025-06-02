'use client';

import React from 'react';
import withAuth from '@/app/components/auth/withAuth';
import MediaUploadForm from '@/app/components/forms/MediaUploadForm';
import { useAuth } from '@/app/context/AuthContext';

function ModeratorPageInternal() {
  const { user, role } = useAuth(); // Get user and role for display if needed

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Moderator Panel</h1>
      <p className="text-md text-gray-600 dark:text-gray-300 mb-6">
        Welcome, {user?.email || 'Moderator'}. Your current role is: <span className="font-semibold capitalize">{role || 'N/A'}</span>.
      </p>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Upload Media</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          As a moderator or admin, you can upload new media files using the form below.
        </p>
        <MediaUploadForm />
      </div>
      {/* More moderator-specific content could go here */}
    </div>
  );
}

// Protect this page and require 'moderator' or 'admin' role
// This will be updated after withAuth is modified to accept an array of roles.
// For now, let's assume 'moderator' is the primary role.
// const ModeratorPage = withAuth(ModeratorPageInternal, 'moderator');

// Temporary: Using 'moderator' - will update HOC and this line later
const ModeratorPage = withAuth(ModeratorPageInternal, ['moderator', 'admin']);


export default ModeratorPage;
