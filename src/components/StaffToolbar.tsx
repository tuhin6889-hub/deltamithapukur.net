import React, { useEffect } from 'react';
import { mountVercelToolbar } from '@vercel/toolbar';

interface StaffToolbarProps {
  isEmployee: boolean;
}

/**
 * Conditionally mounts the Vercel Toolbar for authenticated staff/employees.
 */
export const StaffToolbar: React.FC<StaffToolbarProps> = ({ isEmployee }) => {
  useEffect(() => {
    if (isEmployee) {
      // Check if we are running on Vercel deployment, localhost, or dev mode where Toolbar is supported
      const isVercelHost = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.vercel.app') ||
        Boolean(import.meta.env.VITE_VERCEL_ENV)
      );

      if (isVercelHost) {
        try {
          const cleanup = mountVercelToolbar();
          return () => {
            if (typeof cleanup === 'function') {
              cleanup();
            } else {
              const toolbarEl = document.querySelector('vercel-live-feedback');
              if (toolbarEl) toolbarEl.remove();
            }
          };
        } catch (error) {
          console.warn('Vercel Toolbar initialization bypassed:', error);
        }
      }
    }
  }, [isEmployee]);

  return null;
};
