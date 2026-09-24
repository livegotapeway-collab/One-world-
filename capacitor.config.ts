import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.oneworld.digital",
  appName: "ONEWORLD",
  webDir: "out",
  server: {
    url: "https://one-world-sand.vercel.app/",
    cleartext: false
  }
};

export default config;
