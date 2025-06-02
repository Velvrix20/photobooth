'use client';

import React, { useState, useRef } from 'react';

export default function FileInput({ onFileSelect, accept = "image/*" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!accept.includes(file.type.split('/')[0]) && accept !== "*/*" && !accept.includes(file.type) ) {
        setError(`Invalid file type. Please select ${accept}. Selected: ${file.type}`);
        setSelectedFile(null);
        setPreviewUrl(null);
        onFileSelect(null, null); // Notify parent of no selection
        return;
      }

      // Size limit (e.g., 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        onFileSelect(null, null);
        return;
      }

      setError('');
      setSelectedFile(file);
      onFileSelect(file, URL.createObjectURL(file)); // Pass file and preview URL to parent

      // Create a preview URL for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null); // No preview for non-image files
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      onFileSelect(null, null);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null, null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Select File {accept && `(${accept})`}
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        accept={accept}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>}

      {selectedFile && previewUrl && selectedFile.type.startsWith('image/') && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Preview:</h4>
          <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700" />
        </div>
      )}
      {selectedFile && (
         <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
            <button
                onClick={handleRemoveFile}
                className="mt-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
                Remove file
            </button>
        </div>
      )}
    </div>
  );
}
