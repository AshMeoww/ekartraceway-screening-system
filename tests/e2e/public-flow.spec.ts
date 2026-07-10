import { expect, test } from "@playwright/test";

test("public job list renders", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();
  await expect(page.getByText("Track Operations Associate")).toBeVisible();
});

test("HR route requires authentication or setup", async ({ page }) => {
  await page.goto("/hr");
  await expect(page.getByText("HR access required")).toBeVisible();
});
