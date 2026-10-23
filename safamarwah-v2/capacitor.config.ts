import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "my.safamarwah.companion.v2",
  appName: "SafaMarwah v2",
  webDir: "dist",
  bundledWebRuntime: false,
  android: { allowMixedContent: false }
};

export default config;
