import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from other devices in the network
    port: 3000, // You can change the port if needed
    open: true, // Automatically open browser when running the dev server
    allowedHosts: ["mpeg-nottingham-statute-encyclopedia.trycloudflare.com",
      "yoga-joe-breathing-ak.trycloudflare.com",
      "https://yoga-joe-breathing-ak.trycloudflare.com",
      "localhost"
    ],
  },
});
