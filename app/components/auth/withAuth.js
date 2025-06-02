'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const withAuth = (WrappedComponent, requiredRole = null) => { // Added requiredRole parameter
  const Wrapper = (props) => {
    const { user, session, role, loading } = useAuth(); // Added role from useAuth
    const router = useRouter();

    useEffect(() => {
      if (loading) return; // Wait for loading to complete

      if (!user || !session) {
        router.replace('/login');
        return;
      }

      // Handle role checking
      if (requiredRole) {
        const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!rolesToCheck.includes(role)) {
          // console.log(`Role check failed: User role "${role}" vs Required roles "${rolesToCheck.join(', ')}"`);
          toast.error("You are not authorized to view this page.");
          router.replace('/'); // Redirect to homepage if role doesn't match
          return; // Important to return after redirection
        }
      }
    }, [user, session, role, loading, router, requiredRole]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      );
    }

    if (!user || !session) {
      // Fallback, should be handled by useEffect
      return null;
    }

    // Fallback for role check before rendering component
    if (requiredRole) {
      const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!rolesToCheck.includes(role)) {
        // console.log(`Role check failed (render block): User role "${role}" vs Required roles "${rolesToCheck.join(', ')}"`);
        return ( // Should have been redirected by useEffect, but as a safeguard
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg text-gray-500">Redirecting...</p>
          </div>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };

  const roleDisplay = requiredRole ? (Array.isArray(requiredRole) ? requiredRole.join('|') : requiredRole) : 'any';
  Wrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'}, Role: ${roleDisplay})`;

  return Wrapper;
};

// Need to import toast for the error message
import toast from 'react-hot-toast';

export default withAuth;
