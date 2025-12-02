const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  const sql = `
    SELECT e.idEntrega, e.quantidade, e.dataEntrega,
           p.nomeProduto, c.nome as nomeCliente
    FROM Entregas e
    JOIN Produto p ON e.idProduto = p.numProduto
    JOIN Clientes c ON e.idCliente = c.idCliente
    ORDER BY e.dataEntrega DESC
  `;
  db.all(sql, (err, entregas) => {
    db.all("SELECT * FROM Clientes", (err, clientes) => {
      db.all("SELECT * FROM Produto WHERE estoqueAtual > 0", (err, produtos) => {
        res.render("entrega", { lista: entregas || [], clientes: clientes || [], produtos: produtos || [] });
      });
    });
  });
});

router.post("/add", (req, res) => {
  const { idCliente, idProduto, quantidade } = req.body;
  // Verifica estoque antes
  db.get("SELECT estoqueAtual FROM Produto WHERE numProduto = ?", [idProduto], (err, row) => {
    if (row && row.estoqueAtual >= quantidade) {
      db.run(`INSERT INTO Entregas (idCliente, idProduto, quantidade) VALUES (?, ?, ?)`, [idCliente, idProduto, quantidade], () => {
        db.run(`UPDATE Produto SET estoqueAtual = estoqueAtual - ? WHERE numProduto = ?`, [quantidade, idProduto]);
        res.redirect("/entrega");
      });
    } else {
      res.send("Erro: Estoque insuficiente.");
    }
  });
});

router.get("/delete/:id", (req, res) => {
    db.run(`DELETE FROM Entregas WHERE idEntrega = ?`, [req.params.id], () => res.redirect("/entrega"));
});

module.exports = router;