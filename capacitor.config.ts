import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "sample",
  webDir: "dist",
  server: {
    androidScheme: "https",
    // Add cleartext traffic for development/HTTP APIs
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
    // Add HTTP plugin configuration
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
