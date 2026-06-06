import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", title: "Luke McDowell" },
  { path: "/about", title: "Luke McDowell" },
  { path: "/projects", title: "Luke McDowell" },
  { path: "/blog", title: "Luke McDowell" },
  { path: "/blog/topsify", title: "Luke McDowell" },
  { path: "/blog/hello-world", title: "Luke McDowell" },
];

for (const { path, title } of pages) {
  test(`${path} loads`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
  });
}

test("404 page shows for unknown route", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByText("Page Not Found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
});

test("home nav links navigate correctly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "projects" }).click();
  await expect(page).toHaveURL("/projects");

  await page.goto("/");
  await page.getByRole("link", { name: "blog" }).click();
  await expect(page).toHaveURL("/blog");

  await page.goto("/");
  await page.getByRole("link", { name: "about" }).click();
  await expect(page).toHaveURL("/about");
});

test("blog listing shows posts", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("link", { name: "topSify" })).toBeVisible();
  await expect(page.getByRole("link", { name: "hello world" })).toBeVisible();
});

test("projects listing shows project cards", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("link", { name: /topsify/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /musaic/i })).toBeVisible();
});
