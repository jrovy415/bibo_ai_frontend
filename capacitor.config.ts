import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bibo_ai.app",
  appName: "Bibo AI",
  webDir: "dist",
  server: {
    androidScheme: "https",
    // Add cleartext traffic for development/HTTP APIs
    cleartext: true,
    // Allow external URLs
    allowNavigation: ["https://bibo-ai-backend.onrender.com"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;