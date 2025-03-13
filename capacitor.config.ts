
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.20f571a9fa51426a91f0bdfdfe7cde79',
  appName: 'tuneverse-jukebox',
  webDir: 'dist',
  server: {
    url: 'https://20f571a9-fa51-426a-91f0-bdfdfe7cde79.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    backgroundColor: "#191414"
  }
};

export default config;
