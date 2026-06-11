import { expect, test } from "@playwright/test";

test.describe("public portal smoke", () => {
  test("homepage has clear CTAs and links to the dedicated updates page", async ({ page }) => {
    await page.goto("/mlgrd-guyana/");

    await expect(page.getByRole("heading", { name: /Strong councils/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Find your council/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Report a problem/i }).first()).toBeVisible();

    const updatesRegion = page.getByRole("region", { name: /What’s New at the Ministry|What's New at the Ministry/i });
    await expect(updatesRegion).toBeVisible();
    await expect(updatesRegion.getByRole("link", { name: /View all updates/i })).toBeVisible();
  });

  test("dedicated updates page contains the full ministry timeline", async ({ page }) => {
    await page.goto("/mlgrd-guyana/updates/");

    await expect(page.getByRole("heading", { name: /What’s New at the Ministry|What's New at the Ministry/i }).first()).toBeVisible();
    await expect(page.getByText(/Citizen service portal readiness/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Public service journey/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to Helpdesk/i })).toBeVisible();
  });

  test("helpdesk form blocks empty submission with accessible validation", async ({ page }) => {
    await page.goto("/mlgrd-guyana/helpdesk/");

    await page.getByRole("button", { name: /Continue/i }).click();
    await expect(page.getByText(/required|enter|select/i).first()).toBeVisible();
  });
});

test.describe("admin smoke", () => {
  test("demo admin login reaches overview and shows compact portal update card", async ({ page }) => {
    await page.goto("/mlgrd-guyana/admin/");

    await page.getByRole("textbox", { name: "Username" }).fill("admin");
    await page.getByRole("textbox", { name: "Password" }).fill("mlgrd2026");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText(/Latest portal update/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /View public page/i })).toBeVisible();
  });
});
