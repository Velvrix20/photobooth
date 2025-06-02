'use client';

import { useAuth } from './context/AuthContext';
import MaintenancePage from './maintenance/page';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import CustomCssInjector from './components/CustomCssInjector'; // Import the injector

export default function AppBody({ children }) {
  const { maintenanceMode, user, role, loading } = useAuth();
  const pathname = usePathname();

  // Define routes that should always be accessible, even in maintenance mode
  // This is important for login, Supabase auth callbacks, etc.
  // Also, admin should always be able to access /admin page.
  const allowedPaths = ['/login', '/signup', '/api/auth/callback'];
  if (user && role === 'admin') {
    allowedPaths.push('/admin'); // Admin can access admin page
  }


  // On initial load, if loading is true, we might want to show a global loader
  // or let individual pages/components handle their loading states.
  // For now, we'll just rely on the Auth HOC or page-level loading.
  // if (loading) {
  //   return <div className="flex items-center justify-center min-h-screen"><p>Loading application...</p></div>;
  // }


  // If maintenance mode is ON, and the user is NOT an admin,
  // and the current path is NOT one of the allowed paths:
  if (maintenanceMode && role !== 'admin' && !allowedPaths.includes(pathname)) {
    // If current path is /maintenance, don't render MaintenancePage again (prevents redirect loop if /maintenance is not in allowedPaths)
    if (pathname === '/maintenance') {
        return children; // Or a specific layout for maintenance page itself if it needs AuthContext
    }
    return <MaintenancePage />;
  }

  // If maintenance mode is ON, but user IS an admin OR it's an allowed path:
  // Render the children as normal.
  // Admins see the site, everyone can see login/signup.
  return (
    <>
      <CustomCssInjector />
      {children}
    </>
  );
}
