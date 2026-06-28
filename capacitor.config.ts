import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.groddmedia.smm',
  appName: 'Grodd SMM',
  webDir: 'public',
  server: {
    url: 'https://grodd-smm.online',
    cleartext: true
  }
};

export default config;
