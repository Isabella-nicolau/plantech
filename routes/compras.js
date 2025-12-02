const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Listar e Carregar Formulário
router.get("/", (req, res) => {
  const sqlLista = `
    SELECT c.idCompra, c.quantidade, c.precoCusto, c.dataCompra,
           p.nomeProduto, f.nome as nomeFornecedor
    FROM Compras c
    JOIN Produto p ON c.idProduto = p.numProduto
    JOIN Fornecedores f ON c.idFornecedor = f.idFornecedor
    ORDER BY c.dataCompra DESC
  `;

  db.all(sqlLista, (err, compras) => {
    db.all("SELECT * FROM Fornecedores", (err, fornecedores) => {
      db.all("SELECT * FROM Produto", (err, produtos) => {
        res.render("compras", { 
          lista: compras || [], 
          fornecedores: fornecedores || [], 
          produtos: produtos || [],
          erro: err ? err.message : null 
        });
      });
    });
  });
});

// Adicionar (Gera Pendência na Distribuição)
router.post("/add", (req, res) => {
  const { idProduto, idFornecedor, quantidade, precoCusto } = req.body;
  
  db.run(
    `INSERT INTO Compras (idProduto, idFornecedor, quantidade, precoCusto) VALUES (?, ?, ?, ?)`,
    [idProduto, idFornecedor, quantidade, precoCusto],
    function(err) {
      if (err) return res.send("Erro: " + err.message);
      
      // Regra de Negócio: Criar pendência de logística
      db.run(`INSERT INTO Distribuicao (idCompra) VALUES (?)`, [this.lastID]);
      
      // Atualizar Estoque
      db.run(`UPDATE Produto SET estoqueAtual = estoqueAtual + ? WHERE numProduto = ?`, [quantidade, idProduto]);
      
      res.redirect("/compras");
    }
  );
});

router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Compras WHERE idCompra = ?`, [req.params.id], () => res.redirect("/compras"));
});

module.exports = router;