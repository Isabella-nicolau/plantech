const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR LOCALIDADES + EXIBIR TELA
router.get("/", (req, res) => {
  db.all("SELECT * FROM Localizacao", [], (err, rows) => {
    if (err) return res.send("Erro ao buscar localizações");

    res.render("localidades", { lista: rows });
  });
});

// ADICIONAR LOCALIDADE
router.post("/add", (req, res) => {
  const { numCorredor, numPrateleira, numGaveta, capacidade } = req.body;

  if (!numCorredor || !numPrateleira || !numGaveta || !capacidade)
    return res.send("Erro: todos os campos precisam ser preenchidos.");

  db.run(
    `INSERT INTO Localizacao (numCorredor, numPrateleira, numGaveta, capacidade)
     VALUES (?, ?, ?, ?)`,
    [numCorredor, numPrateleira, numGaveta, capacidade],
    (err) => {
      if (err) return res.send("Erro ao cadastrar localidade.");
      res.redirect("/localidades");
    }
  );
});

// EXCLUIR LOCALIDADE
router.get("/delete/:c/:p/:g", (req, res) => {
  const { c, p, g } = req.params;

  db.run(
    `DELETE FROM Localizacao WHERE numCorredor=? AND numPrateleira=? AND numGaveta=?`,
    [c, p, g],
    (err) => {
      if (err) return res.send("Erro ao excluir localidade.");
      res.redirect("/localidades");
    }
  );
});

module.exports = router;
