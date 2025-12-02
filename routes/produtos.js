const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  const sql = `SELECT p.*, l.numCorredor, l.numPrateleira, l.numGaveta 
               FROM Produto p 
               LEFT JOIN Localizacao l ON p.idLocalizacao = l.idLocalizacao`;
  
  db.all(sql, (err, produtos) => {
    db.all("SELECT * FROM Localizacao", (err, locais) => {
      res.render("produtos", { lista: produtos || [], locais: locais || [] });
    });
  });
});

router.post("/add", (req, res) => {
  const { nomeProduto, precoVenda, idLocalizacao } = req.body;
  db.run(`INSERT INTO Produto (nomeProduto, precoVenda, idLocalizacao) VALUES (?, ?, ?)`, 
    [nomeProduto, precoVenda, idLocalizacao], 
    () => res.redirect("/produtos")
  );
});

router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Produto WHERE numProduto = ?`, [req.params.id], () => res.redirect("/produtos"));
});

module.exports = router;