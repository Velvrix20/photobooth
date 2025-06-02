'use client';

import React, { useState } from 'react';
import FileInput from './FileInput';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { addLogEntry } from '@/lib/utilities'; // Import addLogEntry

export default function MediaUploadForm() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  // const [previewUrl, setPreviewUrl] = useState(null); // Handled by FileInput, not needed here directly
  const [embeddedText, setEmbeddedText] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = (file, preview) => {
    setSelectedFile(file);
    // setPreviewUrl(preview); // If needed for display in this component too
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to upload files.');
      return;
    }

    setIsUploading(true);
    const fileNameParts = selectedFile.name.split('.');
    const fileExtension = fileNameParts.pop();
    const baseName = fileNameParts.join('.');
    // Create a unique file path: user_id/timestamp_uuid_basename.extension
    const filePath = `images/${Date.now()}_${uuidv4().slice(0,8)}_${baseName}.${fileExtension}`;

    try {
      // 1. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photoboot') // Make sure this bucket name is correct
        .upload(filePath, selectedFile, {
          cacheControl: '3600', // Optional: Cache control settings
          upsert: false, // Optional: true to overwrite, false to error if file exists
        });

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('photoboot')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Error getting public URL, path may be incorrect:', filePath, publicUrlData);
        toast.error('File uploaded, but failed to get public URL. Please check console.');
        // Consider deleting the uploaded file if URL retrieval fails catastrophically
        // await supabase.storage.from('photoboot').remove([filePath]);
        setIsUploading(false);
        return;
      }
      const fileUrl = publicUrlData.publicUrl;

      // 3. Insert record into 'media' table
      const mediaRecord = {
        uploader_id: user.id,
        file_name: selectedFile.name,
        storage_path: filePath, // Using the 'path' from uploadData is safer if available
        file_url: fileUrl,
        embedded_text: embeddedText || null, // Ensure null if empty
        file_type: selectedFile.type,
        alt_text: altText || baseName.replace(/[^a-zA-Z0-9 ]/g, " "), // Basic alt text from filename
        // size: selectedFile.size, // Optional: if you have a size column
        // metadata: {}, // Optional: if you have a metadata jsonb column
      };

      // Use .select() to get the inserted data back, including its generated 'id'
      const { data: insertedMedia, error: dbError } = await supabase
        .from('media')
        .insert([mediaRecord])
        .select()
        .single(); // Assuming you insert one record and want it back

      if (dbError) {
        console.error('Database Insert Error:', dbError);
        toast.error(`DB insert failed: ${dbError.message}`);
        // Important: If DB insert fails, consider removing the uploaded file from storage
        // to prevent orphaned files.
        // await supabase.storage.from('photoboot').remove([filePath]);
        addLogEntry('MEDIA_UPLOAD_FAILURE_DB', { file_name: selectedFile.name, error: dbError.message }, user.id);
        setIsUploading(false);
        return;
      }

      if (insertedMedia) {
        addLogEntry('MEDIA_UPLOAD_SUCCESS', { media_id: insertedMedia.id, file_name: insertedMedia.file_name }, user.id);
      } else {
        // Fallback if .select().single() didn't return data as expected, though it should on success
        addLogEntry('MEDIA_UPLOAD_SUCCESS_NO_RETURN_DATA', { file_name: selectedFile.name }, user.id);
      }

      toast.success('File uploaded and record created successfully!');
      setSelectedFile(null);
      setEmbeddedText('');
      setAltText('');
      // Reset FileInput component (This needs to be handled by FileInput itself or by re-keying it)
      // For now, the FileInput's internal state will clear on its own if its ref is reset,
      // or if we pass a prop to it that changes (e.g. a key)

      // To clear FileInput, a common way is to change its `key` prop in the parent,
      // causing it to re-mount. Or, FileInput needs an explicit reset function.
      // For simplicity, we'll rely on FileInput's own 'remove file' button for now.

    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div>
        <FileInput onFileSelect={handleFileSelected} accept="image/*,video/*,audio/*" />
      </div>
      <div>
        <label htmlFor="embeddedText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Embedded Text / Caption (Optional)
        </label>
        <textarea
          id="embeddedText"
          name="embeddedText"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          value={embeddedText}
          onChange={(e) => setEmbeddedText(e.target.value)}
          placeholder="Enter a caption or related text for this media..."
        />
      </div>
       <div>
        <label htmlFor="altText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Alternative Text (Optional)
        </label>
        <input
          type="text"
          id="altText"
          name="altText"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the media for accessibility..."
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
        >
          {isUploading ? 'Uploading...' : 'Upload Media'}
        </button>
      </div>
    </form>
  );
}
