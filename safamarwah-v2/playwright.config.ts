import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/results.xml" }]] : [["list"], ["html", { open: "never" }]],
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "tablet-portrait", use: { viewport: { width: 768, height: 1024 }, browserName: "chromium" } },
    { name: "tablet-landscape", use: { viewport: { width: 1024, height: 768 }, browserName: "chromium" } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, browserName: "chromium" } }
  ],
  webServer: { command: "npm run preview -- --host 127.0.0.1 --port 4173", port: 4173, reuseExistingServer: !process.env.CI }
});
