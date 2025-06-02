'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { addLogEntry } from '@/lib/utilities';
import toast from 'react-hot-toast';

export default function SiteCustomizationForm() {
  const {
    user,
    customCSS, footerText, logoUrl,
    updateSiteCustomization,
    loading: authLoading
  } = useAuth();

  const [localCustomCSS, setLocalCustomCSS] = useState('');
  const [localFooterText, setLocalFooterText] = useState('');
  const [localLogoUrl, setLocalLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalCustomCSS(customCSS || '');
    setLocalFooterText(footerText || '');
    setLocalLogoUrl(logoUrl || '');
  }, [customCSS, footerText, logoUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const settingsToUpdate = {
      custom_css: localCustomCSS,
      footer_text: localFooterText,
      logo_url: localLogoUrl,
    };
    const success = await updateSiteCustomization(settingsToUpdate);
    if (success) {
      addLogEntry('SITE_CUSTOMIZATION_UPDATED', { admin_id: user?.id });
      toast.success('Site customization saved!');
    } else {
      // Error toast is likely shown by updateSiteCustomization in AuthContext
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom CSS
        </label>
        <textarea
          id="customCSS"
          name="customCSS"
          rows="10"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
          placeholder="body { font-family: 'Arial', sans-serif; }"
          value={localCustomCSS}
          onChange={(e) => setLocalCustomCSS(e.target.value)}
          disabled={authLoading || isSaving}
        />
      </div>
      <div>
        <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Footer Text
        </label>
        <input
          type="text"
          id="footerText"
          name="footerText"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
          placeholder="© 2024 Your Site Name"
          value={localFooterText}
          onChange={(e) => setLocalFooterText(e.target.value)}
          disabled={authLoading || isSaving}
        />
      </div>
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Logo URL
        </label>
        <input
          type="text"
          id="logoUrl"
          name="logoUrl"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
          placeholder="/path/to/your/logo.png or https://..."
          value={localLogoUrl}
          onChange={(e) => setLocalLogoUrl(e.target.value)}
          disabled={authLoading || isSaving}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={authLoading || isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save Customization'}
        </button>
      </div>
    </form>
  );
}
