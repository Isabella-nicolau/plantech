const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR DISTRIBUIÇÕES
router.get("/", (req, res) => {
  db.all("SELECT * FROM Distribuicao", [], (err, rows) => {
    if (err) {
      return res.render("distribuicao", {
        lista: [],
        erro: "Erro ao carregar distribuições: " + err.message
      });
    }

    res.render("distribuicao", { lista: rows, erro: null });
  });
});

// ADICIONAR DISTRIBUIÇÃO
router.post("/add", (req, res) => {
  const { produto, quantidade, destino } = req.body;

  if (!produto || !quantidade || !destino)
    return res.send("Preencha todos os campos.");

  db.run(
    `INSERT INTO Distribuicao (produto, quantidade, destino)
     VALUES (?, ?, ?)`,
    [produto, quantidade, destino],
    (err) => {
      if (err) return res.send("Erro ao registrar distribuição.");
      res.redirect("/distribuicao");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM Distribuicao WHERE idDistribuicao = ?`, [id], (err) => {
    if (err) return res.send("Erro ao excluir.");
    res.redirect("/distribuicao");
  });
});

module.exports = router;
