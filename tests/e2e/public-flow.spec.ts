import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function isHrGuarded(page: Page) {
  return page.getByText("HR access required").isVisible().catch(() => false);
}

async function firstPublishedJobHref(page: Page) {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();

  const firstRoleLink = page.getByRole("link", { name: "View role" }).first();

  if ((await firstRoleLink.count()) === 0) {
    return null;
  }

  return firstRoleLink.getAttribute("href");
}

test("public job list renders", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();

  const firstRoleLink = page.getByRole("link", { name: "View role" }).first();

  if ((await firstRoleLink.count()) === 0) {
    await expect(page.getByText("No published roles are available yet.")).toBeVisible();
    return;
  }

  await expect(firstRoleLink).toBeVisible();
});

test("applicant apply page renders the demo application path", async ({ page }) => {
  const jobHref = await firstPublishedJobHref(page);
  test.skip(!jobHref, "No published job is available for the apply-flow smoke test.");

  await page.goto(jobHref!);
  await page.getByRole("link", { name: "Start application" }).click();
  await expect(page.getByRole("heading", { name: /^Apply for / })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("CV file")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit application" })).toBeVisible();
});

test("HR route requires authentication or setup", async ({ page }) => {
  await page.goto("/hr");
  await expect(page.getByText("HR access required")).toBeVisible();
});

test("HR applications table exposes review filters and score columns when authorized", async ({ page }) => {
  await page.goto("/hr/applications");

  if (await isHrGuarded(page)) {
    await expect(page.getByText("HR access required")).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(page.getByPlaceholder("Applicant, email, role, weak area")).toBeVisible();
  await expect(page.getByText("Scores are advisory review signals")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Score" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Semantic" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Weak areas" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "CV parsing" })).toBeVisible();
});

test("HR application detail shows advisory explanation and score breakdown when authorized", async ({ page }) => {
  await page.goto("/hr/applications/app-demo-001");

  if (await isHrGuarded(page)) {
    await expect(page.getByText("HR access required")).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { name: "Why this score?" })).toBeVisible();
  await expect(page.getByText("Advisory only")).toBeVisible();
  await expect(page.getByText("Final advisory score")).toBeVisible();
  await expect(page.getByText("Semantic fit")).toBeVisible();
  await expect(page.getByText("Matched requirements")).toBeVisible();
  await expect(page.getByText("Weak areas")).toBeVisible();
});
