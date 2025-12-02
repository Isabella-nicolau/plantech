const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR PRODUTOS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Produto", [], (err, rows) => {
    if (err) return res.send("Erro ao buscar produtos.");
    res.render("produtos", { lista: rows });
  });
});

// ADICIONAR PRODUTO
router.post("/add", (req, res) => {
  const { nomeProduto, numCorredor, numPrateleira, numGaveta } = req.body;

  if (!nomeProduto) return res.send("Nome do produto é obrigatório.");

  // Verifica se a localidade existe
  db.get(
    `SELECT * FROM Localizacao 
     WHERE numCorredor=? AND numPrateleira=? AND numGaveta=?`,
    [numCorredor, numPrateleira, numGaveta],
    (err, local) => {
      if (err) return res.send("Erro ao validar localidade.");
      if (!local) return res.send("Localidade não encontrada.");

      db.run(
        `INSERT INTO Produto (nomeProduto, numCorredor, numPrateleira, numGaveta)
         VALUES (?, ?, ?, ?)`,
        [nomeProduto, numCorredor, numPrateleira, numGaveta],
        (err) => {
          if (err) return res.send("Erro ao cadastrar produto.");
          res.redirect("/produtos");
        }
      );
    }
  );
});

// EXCLUIR PRODUTO
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM Produto WHERE numProduto = ?`, [id], (err) => {
    if (err) return res.send("Erro ao excluir produto.");
    res.redirect("/produtos");
  });
});

module.exports = router;
