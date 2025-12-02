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

// ADICIONAR FORNECEDOR (RF2)
router.post("/add", (req, res) => {
  const { nome, cnpj, telefone, email, endereco } = req.body;

  // Validação conforme RF2
  if (!nome || !cnpj || !endereco) {
    return res.render("fornecedores", { 
      lista: [], // Em produção, idealmente recarregaríamos a lista aqui
      erro: "Razão Social, CNPJ e Endereço são obrigatórios para o controle de compras." 
    });
  }

  db.run(
    `INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, cnpj, telefone, email, endereco],
    (err) => {
      if (err) return res.send("Erro ao cadastrar fornecedor: " + err.message);
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