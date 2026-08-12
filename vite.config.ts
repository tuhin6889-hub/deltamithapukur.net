import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { vercelToolbar } from '@vercel/toolbar/plugins/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Check if target environment is explicitly Vercel preview or production build target
  const vercelEnv = process.env.VERCEL_ENV || process.env.VITE_VERCEL_ENV;
  const isVercelTarget = Boolean(
    vercelEnv === 'preview' ||
    vercelEnv === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true'
  );

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isVercelTarget ? [vercelToolbar()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
