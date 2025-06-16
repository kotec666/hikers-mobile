import type { CapacitorConfig } from "@capacitor/cli";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const config: CapacitorConfig = {
  appId: "com.hikers.app",
  appName: "hikers",
  webDir: "dist",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#ffffffff",
    },
    BackgroundRunner: {
      label: "com.capacitorjs.background.hikers.task",
      src: "assets/background.js",
      event: "updateData",
      repeat: true,
      interval: 15,
      autoStart: true, // @TODO
    },
  },

  server: process.env.DEV_IPV4
    ? {
        url: process.env.DEV_IPV4,
        cleartext: true,
        //   allowNavigation: ['dev.2chrg.com', process.env.DEV_IPV4],
      }
    : {},
};

export default config;
