const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  db.all("SELECT * FROM Fornecedores ORDER BY nome ASC", [], (err, rows) => {
    if (err) return res.render("fornecedores", { lista: [], erro: err.message });
    res.render("fornecedores", { lista: rows, erro: null });
  });
});

router.post("/add", (req, res) => {
  const { nome, cnpj, telefone, email, endereco } = req.body;
  if (!nome || !cnpj) return res.send("Razão e CNPJ obrigatórios.");
  
  db.run(
    `INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)`,
    [nome, cnpj, telefone, email, endereco],
    (err) => res.redirect("/fornecedores")
  );
});

// NOVA ROTA: ATUALIZAR
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, telefone, email, endereco } = req.body;

  db.run(
    `UPDATE Fornecedores SET nome=?, cnpj=?, telefone=?, email=?, endereco=? WHERE idFornecedor=?`,
    [nome, cnpj, telefone, email, endereco, id],
    (err) => res.redirect("/fornecedores")
  );
});

router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Fornecedores WHERE idFornecedor=?`, [req.params.id], () => res.redirect("/fornecedores"));
});

module.exports = router;