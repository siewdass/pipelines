import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/authentication': { target: 'http://api:4000', changeOrigin: true },
      '/auth': { target: 'http://storage:4001', changeOrigin: true },
      '/assets': { target: 'http://storage:4001', changeOrigin: true },
      '/project': {
        target: 'http://api:4000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url!.startsWith('/projects')) {
            return req.url
          }
        }
      },
      '/user': { target: 'http://api:4000', changeOrigin: true },
      '/origin': { target: 'http://api:4000', changeOrigin: true },
      '/database': { target: 'http://api:4000', changeOrigin: true },
      '/assemble': { target: 'http://api:4000', changeOrigin: true },
      '/email': { target: 'http://api:4000', changeOrigin: true },
      '/build': { target: 'http://api:4000', changeOrigin: true },
      '/source': { target: 'http://api:4000', changeOrigin: true },
      '/features': { target: 'http://api:4000', changeOrigin: true },
      '/prompts': { target: 'http://api:4000', changeOrigin: true },
      '/serve': { target: 'http://runtime:4002', changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 20000,
  }
});
