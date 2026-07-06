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
    expect(body).toContain("Acesso Negado");
  });

  test("Login, criar servico, abrir OS e concluir", async ({ page }) => {
    const sufixo = Date.now();
    const nomeCliente = "Cliente E2E " + sufixo;
    const nomeServico = "Servico E2E " + sufixo;

    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");

    await page.goto("http://localhost:3000/clientes");
    await page.fill("#inputNome", nomeCliente);
    await page.fill("#inputDoc", "32165498700");
    await page.fill("#inputEnd", "Rua de Teste, 123");
    await page.click("#btnSalvar");
    await page.waitForLoadState("networkidle");

    await page.goto("http://localhost:3000/servicos");
    await page.fill("#inputNome", nomeServico);
    await page.fill("#inputPreco", "40");
    await page.click("#btnSalvar");
    await page.waitForLoadState("networkidle");

    await page.goto("http://localhost:3000/ordens");
    await page.selectOption('select[name="idCliente"]', { label: nomeCliente });
    await page.selectOption("#selServico", { label: nomeServico + " (R$ 40.00)" });
    await page.fill("#qtdServico", "1");
    await page.click('button:has-text("Incluir na ordem")');
    await page.click('button:has-text("Abrir ordem de servico")');
    await page.waitForLoadState("networkidle");

    const linha = page.locator("#tabelaOrdens tbody tr").first();
    await expect(linha).toContainText(nomeCliente);

    page.once("dialog", (dialog) => dialog.accept());
    await linha.locator('a:has-text("Concluir")').click();
    await page.waitForLoadState("networkidle");

    const linhaAtualizada = page.locator("#tabelaOrdens tbody tr").filter({ hasText: nomeCliente }).first();
    await expect(linhaAtualizada).toContainText("Concluida");
  });
});
