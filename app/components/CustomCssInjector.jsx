'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

const CustomCssInjector = () => {
  const { customCSS } = useAuth();
  const styleElementId = 'custom-site-styles';

  useEffect(() => {
    let styleElement = document.getElementById(styleElementId);

    if (customCSS && customCSS.trim() !== '') {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleElementId;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = customCSS;
    } else {
      // If customCSS is empty or null, remove the style tag if it exists
      if (styleElement) {
        styleElement.innerHTML = ''; // Clear its content
        // Optionally, remove the element: styleElement.parentNode.removeChild(styleElement);
        // For simplicity, clearing innerHTML is often sufficient and avoids re-creating it if CSS is added back.
      }
    }

    // Cleanup function (optional, as this component might live for the app's lifetime)
    // If this component could unmount while the app is running and CSS should be removed then,
    // this cleanup is more critical.
    return () => {
      const existingStyleElement = document.getElementById(styleElementId);
      if (existingStyleElement) {
        // On component unmount, you might want to remove the styles
        // or leave them if the app is closing anyway.
        // For a settings change, they'd be updated by the useEffect above.
        // existingStyleElement.innerHTML = ''; // Or remove the element
      }
    };
  }, [customCSS]); // Re-run effect if customCSS changes

  return null; // This component does not render any visible UI itself
};

export default CustomCssInjector;
