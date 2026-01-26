import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.redcreativa.escritoria',
  appName: 'Escritor IA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
