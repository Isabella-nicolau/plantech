const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

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
      res.redirect("/fornecedores");
    }
  );
});

// EXCLUIR FORNECEDOR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Fornecedores WHERE idFornecedor = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se há compras vinculadas.");
    res.redirect("/fornecedores");
  });
});

module.exports = router;