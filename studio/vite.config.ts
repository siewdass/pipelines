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
      '/authentication': { target: 'http://management:4000', changeOrigin: true },
      '/auth': { target: 'http://identity:4010', changeOrigin: true },
      '/assets': { target: 'http://assets:4012', changeOrigin: true },
      '/project': {
        target: 'http://management:4000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url!.startsWith('/projects')) {
            return req.url
          }
        }
      },
      '/user': { target: 'http://identity:4010', changeOrigin: true },
      '/origin': { target: 'http://management:4000', changeOrigin: true },
      '/inquiry': { target: 'http://storage:4001', changeOrigin: true },
      '/mutation': { target: 'http://storage:4001', changeOrigin: true },
      '/database': { target: 'http://management:4000', changeOrigin: true },
      '/assemble': { target: 'http://management:4000', changeOrigin: true },
      '/email': { target: 'http://management:4000', changeOrigin: true },
      '/build': { target: 'http://management:4000', changeOrigin: true },
      '/source': { target: 'http://management:4000', changeOrigin: true },
      '/features': { target: 'http://management:4000', changeOrigin: true },
      '/prompts': { target: 'http://management:4000', changeOrigin: true },
      '/serve': { target: 'http://runtime:4002', changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 20000,
  }
});
