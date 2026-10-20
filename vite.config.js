import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js's complete WebGL renderer is 737 KB minified and about 187 KB gzipped.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-vendor', test: /node_modules\/three\//, priority: 20 },
            { name: 'r3f-vendor', test: /node_modules\/(?:@react-three|react-reconciler|scheduler)\//, priority: 15 },
            { name: 'motion-vendor', test: /node_modules\/(?:framer-motion|motion-dom|motion-utils)\//, priority: 10 },
            { name: 'react-vendor', test: /node_modules\/(?:react|react-dom)\//, priority: 5 },
          ],
        },
      },
    },
  },
});
