import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the client-only build.
// In development, Vite runs as Express middleware (see server.ts).
// In production, `vite build` outputs to dist/public and Express serves it statically.
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist/public',
        emptyOutDir: true,
    },
});
