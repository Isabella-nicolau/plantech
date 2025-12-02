const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// TELA DE ENTRADA (Compras)
router.get("/", (req, res) => {
  db.all("SELECT * FROM Fornecedores ORDER BY nome ASC", (err, fornecedores) => {
    db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", (err, produtos) => {
      // Histórico de Compras (Cabeçalho)
      const sqlHist = `
        SELECT c.idCompra, c.dataCompra, c.valorTotal, f.nome as nomeFornecedor
        FROM Compras c
        JOIN Fornecedores f ON c.idFornecedor = f.idFornecedor
        ORDER BY c.dataCompra DESC
      `;
      db.all(sqlHist, (err, historico) => {
        res.render("compras", { 
          fornecedores: fornecedores || [], 
          produtos: produtos || [], 
          historico: historico || [],
          erro: null 
        });
      });
    });
  });
});

// PROCESSAR COMPRA (RF5) - CÓDIGO CORRIGIDO
router.post("/add", (req, res) => {
  const { idFornecedor, itensCarrinho } = req.body;
  let itens;

  try {
    itens = JSON.parse(itensCarrinho);
  } catch (e) {
    return res.send("Erro nos dados do carrinho.");
  }

  if (!idFornecedor || !itens || itens.length === 0) {
    return res.send("Erro: Fornecedor e Produtos são obrigatórios.");
  }

  // 1. Calcula Total
  const valorTotal = itens.reduce((acc, item) => acc + (item.qtd * item.custo), 0);

  // 2. Cria Cabeçalho da Compra
  db.run(
    `INSERT INTO Compras (idFornecedor, valorTotal) VALUES (?, ?)`,
    [idFornecedor, valorTotal],
    function(err) {
      if (err) return res.send("Erro ao registrar compra: " + err.message);
      
      const idCompra = this.lastID;
      
      // 3. Processa Itens (Usando db.run direto para evitar erro de Finalize)
      // db.serialize garante a ordem de execução
      db.serialize(() => {
        itens.forEach(item => {
          const subtotal = item.qtd * item.custo;
          
          // a) Grava Item da Compra
          db.run(
            `INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (?, ?, ?, ?, ?)`,
            [idCompra, item.id, item.qtd, item.custo, subtotal],
            function(err) {
              if (err) return console.error("Erro item compra:", err);

              // b) Gera tarefa de distribuição para este item específico
              // (Agora seguro pois usamos db.run direto, sem prepared statement fechado)
              const idItemInserido = this.lastID;
              db.run(`INSERT INTO Distribuicao (idItemCompra) VALUES (?)`, [idItemInserido]);
            }
          );
  
          // c) Atualiza Estoque (RF5 - Automático)
          db.run(`UPDATE Produto SET estoqueAtual = estoqueAtual + ? WHERE numProduto = ?`, [item.qtd, item.id]);
        });
      });

      res.redirect("/compras");
    }
  );
});

// EXCLUIR COMPRA
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Compras WHERE idCompra = ?`, [req.params.id], () => res.redirect("/compras"));
});

module.exports = router;