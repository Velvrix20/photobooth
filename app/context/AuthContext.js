'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  // const [loading, setLoading] = useState(true); // Original loading, now combined into appLoading
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [customCSS, setCustomCSS] = useState('');
  const [footerText, setFooterText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [appLoading, setAppLoading] = useState(true); // Combined loading state for all initial fetches

  // Function to fetch all settings from 'settings' table (id=1)
  const fetchSiteSettings = async () => {
    try {
      const { data, error, status } = await supabase
        .from('settings')
        .select('maintenance_mode, custom_css, footer_text, logo_url')
        .eq('id', 1)
        .single();

      if (error && status !== 406) {
        // Don't toast error here as table/row might not exist yet.
        setMaintenanceMode(false);
        setCustomCSS('');
        setFooterText(''); // Set default footer text if desired
        setLogoUrl('');
        return;
      }
      if (data) {
        setMaintenanceMode(data.maintenance_mode || false);
        setCustomCSS(data.custom_css || '');
        setFooterText(data.footer_text || '');
        setLogoUrl(data.logo_url || '');
      } else {
        setMaintenanceMode(false);
        setCustomCSS('');
        setFooterText('');
        setLogoUrl('');
      }
    } catch (e) {
      // Default to safe values on catch
      setMaintenanceMode(false);
      setCustomCSS('');
      setFooterText('');
      setLogoUrl('');
    }
  };

  // Function to update maintenance status in Supabase
  const updateMaintenanceStatusInSupabase = async (newStatus) => { // Renamed for clarity
    setAppLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ maintenance_mode: newStatus })
        .eq('id', 1);

      if (error) {
        toast.error('Failed to update maintenance mode: ' + error.message);
        return false;
      }
      setMaintenanceMode(newStatus);
      toast.success(`Maintenance mode ${newStatus ? 'enabled' : 'disabled'}.`);
      return true;
    } catch (error) {
      toast.error('Error updating maintenance status: ' + error.message);
      return false;
    } finally {
      setAppLoading(false);
    }
  };


  useEffect(() => {
    const initializeApp = async () => {
      setAppLoading(true);
      // Fetch initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user);
      }
      // Fetch all initial site settings
      await fetchSiteSettings();
      setAppLoading(false);
      // setLoading(false);
    };

    initializeApp();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setAppLoading(true); // Indicate loading during auth changes
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user);
      } else {
        setRole(null);
      }
      // Site settings (like CSS, footer) are generally not user-specific,
      // so they don't necessarily need to be re-fetched on auth change unless logic dictates.
      // The real-time subscription handles external changes to settings.
      setAppLoading(false);
      // setLoading(false);
    });

    // Realtime subscription for ALL settings changes on the specific row
    const settingsChannel = supabase
      .channel('site-settings-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' },
        (payload) => {
          const newSettings = payload.new;
          if (newSettings.hasOwnProperty('maintenance_mode')) {
            setMaintenanceMode(newSettings.maintenance_mode);
            toast.info(`Maintenance mode is now ${newSettings.maintenance_mode ? 'ON' : 'OFF'}.`);
          }
          if (newSettings.hasOwnProperty('custom_css')) {
            setCustomCSS(newSettings.custom_css || '');
          }
          if (newSettings.hasOwnProperty('footer_text')) {
            setFooterText(newSettings.footer_text || '');
          }
          if (newSettings.hasOwnProperty('logo_url')) {
            setLogoUrl(newSettings.logo_url || '');
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
            console.error(`AuthContext: Settings Channel error: ${err?.message}`);
        }
      });

    return () => {
      authListener?.unsubscribe();
      if (settingsChannel) {
        supabase.removeChannel(settingsChannel).catch(err => console.error("Error removing settings channel", err));
      }
    };
  }, []);

  const fetchUserProfile = async (currentUser) => {
    if (!currentUser) return;
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (error && status !== 406) {
        // Silently ignore if profile not found or RLS prevents access for this user
      } else if (data) {
        setRole(data.role);
      } else {
        setRole(null);
      }
    } catch (error) {
      setRole(null);
    }
  };

  const logout = async () => {
    setAppLoading(true); // Use appLoading for consistency
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed: ' + error.message);
    } else {
      setUser(null);
      setSession(null);
      setRole(null);
      // Site settings (CSS, footer, logo, maintenance mode) remain as they are, not user-specific.
      toast.success('Logged out successfully');
    }
    setAppLoading(false);
  };

  // Function to update multiple site settings (CSS, footer, logo)
  const updateSiteCustomization = async (settingsToUpdate) => {
    setAppLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(settingsToUpdate) // e.g., { custom_css: "...", footer_text: "..." }
        .eq('id', 1)
        .select() // Select the updated row to confirm and get all values
        .single();

      if (error) {
        toast.error('Failed to update site customization: ' + error.message);
        return false;
      }
      if (data) {
        // Update local state from the returned data to ensure consistency
        if (data.hasOwnProperty('custom_css')) setCustomCSS(data.custom_css || '');
        if (data.hasOwnProperty('footer_text')) setFooterText(data.footer_text || '');
        if (data.hasOwnProperty('logo_url')) setLogoUrl(data.logo_url || '');
        // Maintenance mode is handled by its own function for clearer separation
      }
      toast.success('Site customization updated successfully!');
      return true;
    } catch (e) {
      toast.error('Error updating site customization: ' + e.message);
      return false;
    } finally {
      setAppLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, role,
      loading: appLoading, // Use appLoading as the main loading indicator
      logout,
      maintenanceMode,
      updateMaintenanceStatus: updateMaintenanceStatusInSupabase, // Renamed for clarity
      fetchSiteSettings, // Expose if manual refresh needed elsewhere
      customCSS, footerText, logoUrl,
      updateSiteCustomization // New function to update CSS, footer, logo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
