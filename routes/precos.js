const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR PREÇOS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Precos", [], (err, rows) => {
    if (err) {
      return res.render("precos", {
        lista: [],
        erro: "Erro ao carregar preços: " + err.message
      });
    }

    res.render("precos", { lista: rows, erro: null });
  });
});

// ADICIONAR
router.post("/add", (req, res) => {
  const { produto, fornecedor, preco } = req.body;

  if (!produto || !fornecedor || !preco)
    return res.send("Todos os campos são obrigatórios.");

  db.run(
    `INSERT INTO Precos (produto, fornecedor, preco)
     VALUES (?, ?, ?)`,
    [produto, fornecedor, preco],
    (err) => {
      if (err) return res.send("Erro ao registrar preço.");
      res.redirect("/precos");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM Precos WHERE idPreco = ?`, [id], (err) => {
    if (err) return res.send("Erro ao excluir preço.");
    res.redirect("/precos");
  });
});

module.exports = router;
