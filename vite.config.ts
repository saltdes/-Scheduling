import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Use logical OR to ensure it's always a string, preventing 'undefined' crashes
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      'process.env': {}
    },
  };
});