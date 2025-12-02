const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM Fornecedores", [], (err, rows) => {
    if (err) {
      return res.render("fornecedores", {
        lista: [],
        erro: "Erro ao carregar fornecedores: " + err.message
      });
    }

    res.render("fornecedores", { lista: rows, erro: null });
  });
});

// ADICIONAR
router.post("/add", (req, res) => {
  const { nome, cnpj, telefone, email } = req.body;

  if (!nome || !cnpj)
    return res.send("Nome e CNPJ são obrigatórios.");

  db.run(
    `INSERT INTO Fornecedores (nome, cnpj, telefone, email)
     VALUES (?, ?, ?, ?)`,
    [nome, cnpj, telefone, email],
    (err) => {
      if (err) return res.send("Erro ao cadastrar fornecedor.");
      res.redirect("/fornecedores");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Fornecedores WHERE idFornecedor=?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir fornecedor.");
    res.redirect("/fornecedores");
  });
});

module.exports = router;
