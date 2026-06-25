const { test, expect } = require("@playwright/test");

test.describe("E2E: Login e Dashboard", () => {
  test("Login com admin/admin chega ao dashboard", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");

    const title = await page.textContent(".topbar-title h2");
    expect(title).toContain("Dashboard");
  });

  test("Operador acessa vendas mas nao relatorios", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    await page.fill('input[name="username"]', "vendedor");
    await page.fill('input[name="password"]', "vendedor");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard");

    await page.goto("http://localhost:3000/vendas");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/vendas");

    await page.goto("http://localhost:3000/relatorios");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body");
    expect(body).toContain("Acesso negado");
  });
});
