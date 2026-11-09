import {defineConfig} from 'vite';
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if(id.includes('/phaser/')) return 'phaser';
          if(id.includes('/@supabase/')) return 'supabase';
          if(id.includes('/react-dom/') || id.includes('/react/')) return 'react';
        }
      }
    }
  }
});
