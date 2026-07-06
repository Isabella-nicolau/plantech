const request = require("supertest");
const initDb = require("../db/init");
const app = require("../app");
const db = require("../db/database");

beforeAll(async () => {
  await initDb();
});

function dbGet(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params || [], (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params || [], function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

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
  });

  test("POST /api/login com credenciais erradas retorna 401", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ username: "admin", password: "errada" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });
});

describe("Ordem de Servico", () => {
  const agent = request.agent(app);
  let idCliente;
  let idServico;

  beforeAll(async () => {
    await agent.post("/login").type("form").send({ username: "admin", password: "admin" });

    const cliente = await dbRun(
      "INSERT INTO Clientes (tipo, nome, documento) VALUES ('PF', 'Cliente Teste OS', '11122233344')"
    );
    idCliente = cliente.lastID;

    const servico = await dbRun(
      "INSERT INTO Servico (nome, preco, ativo) VALUES ('Servico Teste OS', 25, 1)"
    );
    idServico = servico.lastID;
  });

  test("bloqueia criacao de OS sem itens", async () => {
    const antes = await dbGet("SELECT COUNT(*) as total FROM OrdemServico");

    const res = await agent
      .post("/ordens/add")
      .type("form")
      .send({ idCliente, itensCarrinho: "[]" });

    expect(res.text).toContain("Erro");

    const depois = await dbGet("SELECT COUNT(*) as total FROM OrdemServico");
    expect(depois.total).toBe(antes.total);
  });

  test("cria OS via rota, persiste valorTotal e permite concluir", async () => {
    const itensCarrinho = JSON.stringify([{ id: idServico, nome: "Servico Teste OS", qtd: 2, preco: 25 }]);

    const resAdd = await agent
      .post("/ordens/add")
      .type("form")
      .send({ idCliente, idFuncionario: "", dataAgendada: "", observacao: "", itensCarrinho });

    expect(resAdd.status).toBe(302);
    expect(resAdd.headers.location).toBe("/ordens");

    const os = await dbGet("SELECT * FROM OrdemServico ORDER BY idOS DESC LIMIT 1");
    expect(os.status).toBe("ABERTA");
    expect(os.valorTotal).toBe(50);
    expect(os.idCliente).toBe(idCliente);

    const resConcluir = await agent.get(`/ordens/concluir/${os.idOS}`);
    expect(resConcluir.status).toBe(302);

    const osAtualizada = await dbGet("SELECT * FROM OrdemServico WHERE idOS = ?", [os.idOS]);
    expect(osAtualizada.status).toBe("CONCLUIDA");
    expect(osAtualizada.dataConclusao).not.toBeNull();
  });
});
