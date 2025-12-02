const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR
router.get("/", (req, res) => {
  // Ordena fisicamente para facilitar a conferência visual
  db.all("SELECT * FROM Localizacao ORDER BY numCorredor, numPrateleira, numGaveta", [], (err, rows) => {
    if (err) return res.render("localidades", { lista: [], erro: "Erro ao carregar locais." });
    res.render("localidades", { lista: rows, erro: null });
  });
});

// ADICIONAR
router.post("/add", (req, res) => {
  const { numCorredor, numPrateleira, numGaveta, capacidade } = req.body;

  if (!numCorredor || !numPrateleira || !numGaveta) 
    return res.render("localidades", { lista: [], erro: "Todos os campos numéricos são obrigatórios." });

  db.run(
    `INSERT INTO Localizacao (numCorredor, numPrateleira, numGaveta, capacidade) VALUES (?, ?, ?, ?)`,
    [numCorredor, numPrateleira, numGaveta, capacidade],
    (err) => {
      if (err) {
        // Tratamento de erro específico para duplicidade (UNIQUE constraint)
        if(err.message.includes("UNIQUE")) 
          return res.send("Erro: Esta localização já existe!");
        return res.send("Erro ao cadastrar: " + err.message);
      }
      res.redirect("/localidades");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Localizacao WHERE idLocalizacao = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se há produtos vinculados.");
    res.redirect("/localidades");
  });
});

module.exports = router;