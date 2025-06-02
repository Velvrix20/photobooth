'use client';

import React, { useState, useEffect, useCallback } from 'react';
import withAuth from '@/app/components/auth/withAuth';
import { useAuth } from '@/app/context/AuthContext';
import MediaUploadForm from '@/app/components/forms/MediaUploadForm';
import { addLogEntry } from '@/lib/utilities';
// Removed supabase and toast imports as they are now in sub-components
import SiteCustomizationForm from '@/app/components/admin/SiteCustomizationForm'; // Import new component
import SystemLogsViewer from '@/app/components/admin/SystemLogsViewer'; // Import new component


function AdminPageInternal() {
  const {
    user,
    maintenanceMode, updateMaintenanceStatus,
    loading: authLoading // Only need user, maintenance, and general loading from AuthContext directly here
  } = useAuth();

  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  const handleToggleMaintenanceMode = async () => {
    setIsUpdatingMaintenance(true);
    const newStatus = !maintenanceMode;
    const success = await updateMaintenanceStatus(newStatus);
    if (success) {
      addLogEntry(
        newStatus ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
        {},
        user?.id
      );
    }
    setIsUpdatingMaintenance(false);
  };

  // Note: Fetching logs and saving customization logic is now within their respective components.
  // If authLoading is true, some sections might show their own loading states or be disabled.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Admin Panel</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8"> {/* Added space-y-8 for spacing between sections */}

        <div> {/* Welcome message */}
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to the Admin Panel, {user?.email || 'Admin'}. Only users with the 'admin' role can see this page.
          </p>
        </div>

        {/* Site Settings (Maintenance Mode) */}
        <div className="border-t pt-6 mt-6"> {/* Added mt-6 for consistent spacing too */}
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Site Settings</h2>
          {authLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading site settings...</p>
          ) : (
            <div className="flex items-center">
              <p className="mr-4 text-gray-700 dark:text-gray-300">
                Maintenance Mode:
                <span className={`font-bold ${maintenanceMode ? 'text-red-500' : 'text-green-500'}`}>
                  {maintenanceMode ? ' ON' : ' OFF'}
                </span>
              </p>
              <button
                onClick={handleToggleMaintenanceMode}
                disabled={isUpdatingMaintenance || authLoading}
                className={`px-4 py-2 rounded font-semibold text-white
                  ${isUpdatingMaintenance || authLoading ? 'bg-gray-400 cursor-not-allowed' :
                  (maintenanceMode ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600')}`}
              >
                {isUpdatingMaintenance ? 'Updating...' : (maintenanceMode ? 'Turn OFF' : 'Turn ON')}
              </button>
            </div>
          )}
        </div>

        {/* Site Customization Section - Uses new component */}
        <div className="border-t pt-6 mt-6">
          <SiteCustomizationForm />
        </div>

        {/* Media Upload Section */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Upload Media</h2>
          <MediaUploadForm />
        </div>

        {/* System Logs Section - Uses new component */}
        <div className="border-t pt-6 mt-6">
          <SystemLogsViewer />
        </div>

      </div>
    </div>
  );
}

// Protect this page and require 'admin' role
const AdminPage = withAuth(AdminPageInternal, 'admin');

export default AdminPage;
