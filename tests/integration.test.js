const request = require("supertest");

// Precisa do banco populado: node db/init.js antes de rodar
const app = require("../app");

describe("Rotas protegidas por sessao", () => {
  test("GET /produtos sem sessao redireciona para /login (302)", async () => {
    const res = await request(app).get("/produtos");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  test("GET /dashboard sem sessao redireciona para /login (302)", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });
});

describe("API protegida por JWT", () => {
  test("GET /api/produtos sem token retorna 401", async () => {
    const res = await request(app).get("/api/produtos");
    expect(res.status).toBe(401);
    expect(res.body.erro).toBeDefined();
  });

  test("GET /api/produtos com token valido retorna 200", async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({ username: "admin", password: "admin" })
      .set("Content-Type", "application/json");

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    const token = loginRes.body.token;
    const prodRes = await request(app)
      .get("/api/produtos")
      .set("Authorization", "Bearer " + token);

    expect(prodRes.status).toBe(200);
    expect(Array.isArray(prodRes.body)).toBe(true);
    expect(prodRes.body.length).toBeGreaterThan(0);
  });

  test("POST /api/login com credenciais erradas retorna 401", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ username: "admin", password: "errada" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });
});
