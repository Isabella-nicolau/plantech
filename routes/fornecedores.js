const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");
const { registrarLog } = require("../helpers/audit");

// LISTAR FORNECEDORES
router.get("/", (req, res) => {
  db.all("SELECT * FROM Fornecedores ORDER BY nome ASC", [], (err, rows) => {
    if (err) {
      return res.render("fornecedores", { 
        lista: [], 
        erro: "Erro ao carregar fornecedores: " + err.message 
      });
    }
    res.render("fornecedores", { lista: rows, erro: null });
  });
});

// ADICIONAR FORNECEDOR
router.post("/add", (req, res) => {
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // VALIDAÇÃO: Nome e CNPJ são obrigatórios
  if (!nome || !cnpj) {
    // Recarrega a página mostrando o erro
    return db.all("SELECT * FROM Fornecedores ORDER BY nome ASC", [], (err, rows) => {
      res.render("fornecedores", { 
        lista: rows || [],
        erro: "Erro: Razão Social e CNPJ são obrigatórios." 
      });
    });
  }

  db.run(
    `INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, cnpj, telefone, email, endereco],
    (err) => {
      if (err) {
        return db.all("SELECT * FROM Fornecedores ORDER BY nome ASC", [], (errRows, rows) => {
          res.render("fornecedores", { lista: rows, erro: "Erro no banco: " + err.message });
        });
      }
      registrarLog(req, "FORNECEDOR_CRIADO", `Fornecedor "${nome}" (${cnpj}) criado`);
      res.redirect("/fornecedores");
    }
  );
});

// ATUALIZAR FORNECEDOR
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, telefone, email, endereco } = req.body;

  if (!nome || !cnpj) {
    return res.send("Erro: Nome e CNPJ não podem ficar vazios.");
  }

  db.run(
    `UPDATE Fornecedores 
     SET nome = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? 
     WHERE idFornecedor = ?`,
    [nome, cnpj, telefone, email, endereco, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      registrarLog(req, "FORNECEDOR_EDITADO", `Fornecedor #${id} "${nome}" atualizado`);
      res.redirect("/fornecedores");
    }
  );
});

// CONSULTA CNPJ VIA BRASILAPI
router.get("/consulta-cnpj/:cnpj", async (req, res) => {
  const cnpj = req.params.cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) {
    return res.status(400).json({ erro: "CNPJ deve ter 14 digitos." });
  }
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { "User-Agent": "PlanTech-ERP/1.0" }
    });
    if (!response.ok) {
      const status = response.status;
      if (status === 404) return res.status(404).json({ erro: "CNPJ nao encontrado." });
      return res.status(502).json({ erro: "Erro ao consultar API externa." });
    }
    const data = await response.json();
    res.json({
      nome: data.razao_social || "",
      email: data.email && data.email !== "null" ? data.email : "",
      telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : "",
      endereco: [data.logradouro, data.numero, data.bairro, data.municipio, data.uf].filter(Boolean).join(", ")
    });
  } catch (err) {
    res.status(502).json({ erro: "Falha na comunicacao com a API." });
  }
});

// EXCLUIR FORNECEDOR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Fornecedores WHERE idFornecedor = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se há compras vinculadas.");
    registrarLog(req, "FORNECEDOR_EXCLUIDO", `Fornecedor #${req.params.id} excluido`);
    res.redirect("/fornecedores");
  });
});

module.exports = router;