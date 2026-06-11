import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT || 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}/mlgrd-guyana`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `NEXT_PUBLIC_BASE_PATH=/mlgrd-guyana npm run build && rm -rf /tmp/mlgrd-playwright-root && mkdir -p /tmp/mlgrd-playwright-root && ln -s ${process.cwd()}/out /tmp/mlgrd-playwright-root/mlgrd-guyana && npx serve@latest /tmp/mlgrd-playwright-root -l ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
