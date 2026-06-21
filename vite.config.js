import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/dx-specialist-jp/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
