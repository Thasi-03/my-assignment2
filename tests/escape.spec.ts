import { test, expect } from "@playwright/test";

test("complete escape flow and reach results", async ({ page }) => {
  await page.goto("/escape");

  // start timer
  await page.getByRole("button", { name: /start/i }).click();

  // stage 1
  await page.getByLabel(/decoded phrase/i).fill("there is a secret passphrase");
  await page.getByRole("button", { name: /submit/i }).click();

  // stage 2
  await page.getByLabel(/^total$/i).fill("26");
  await page.getByRole("button", { name: /submit/i }).click();

  // stage 3
  await page.getByLabel(/^html$/i).fill("<!doctype html><html><body>ok</body></html>");
  await page.getByRole("button", { name: /submit/i }).click();

  // we added a 5s escape animation; allow for it then check results
  await page.waitForURL(/\/results\?/, { timeout: 10_000 });
  await expect(page).toHaveURL(/\/results\?/);
});
