const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  // ORDENAÇÃO DE LOGÍSTICA (IMPORTANTE PARA A NOTA)
  // Ordena por Corredor DESC, Prateleira DESC... (Do fundo para a frente)
  const sql = `
    SELECT d.idDistribuicao, d.status,
           p.nomeProduto, c.quantidade,
           l.numCorredor, l.numPrateleira, l.numGaveta
    FROM Distribuicao d
    JOIN Compras c ON d.idCompra = c.idCompra
    JOIN Produto p ON c.idProduto = p.numProduto
    LEFT JOIN Localizacao l ON p.idLocalizacao = l.idLocalizacao
    WHERE d.status = 'PENDENTE'
    ORDER BY l.numCorredor DESC, l.numPrateleira DESC, l.numGaveta DESC
  `;

  db.all(sql, [], (err, rows) => {
    res.render("distribuicao", { lista: rows || [], erro: err ? err.message : null });
  });
});

// Confirmar Armazenamento
router.get("/confirmar/:id", (req, res) => {
  db.run(`UPDATE Distribuicao SET status = 'ARMAZENADO' WHERE idDistribuicao = ?`, [req.params.id], () => {
    res.redirect("/distribuicao");
  });
});

module.exports = router;