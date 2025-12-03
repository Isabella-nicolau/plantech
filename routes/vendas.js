const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// TELA DE VENDAS (PDV)
router.get("/", (req, res) => {
  db.all("SELECT * FROM Clientes ORDER BY nome ASC", (err, clientes) => {
    db.all("SELECT * FROM Produto WHERE estoqueAtual > 0 ORDER BY nomeProduto ASC", (err, produtos) => {
      // Histórico atualizado com desconto
      const sqlHist = `
        SELECT v.idVenda, v.dataVenda, v.valorTotal, v.desconto, v.formaPagamento, c.nome as nomeCliente
        FROM Vendas v
        JOIN Clientes c ON v.idCliente = c.idCliente
        ORDER BY v.dataVenda DESC
      `;
      db.all(sqlHist, (err, historico) => {
        res.render("vendas", { 
          clientes: clientes || [], 
          produtos: produtos || [], 
          historico: historico || [],
          erro: null 
        });
      });
    });
  });
});

// PROCESSAR VENDA (Com Desconto)
router.post("/add", (req, res) => {
  const { idCliente, formaPagamento, desconto, itensCarrinho } = req.body;
  let itens;

  try {
    itens = JSON.parse(itensCarrinho);
  } catch (e) {
    return res.send("Erro ao processar itens.");
  }

  if (!idCliente || !itens || itens.length === 0) {
    return res.send("Erro: Venda incompleta.");
  }

  // Cálculos Financeiros
  const valorDesconto = parseFloat(desconto) || 0;
  const subtotalGeral = itens.reduce((acc, item) => acc + (item.qtd * item.preco), 0);
  const valorTotalFinal = Math.max(0, subtotalGeral - valorDesconto); // Evita valor negativo

  // 1. Cria Venda
  db.run(
    `INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento) VALUES (?, ?, ?, ?, ?)`,
    [idCliente, subtotalGeral, valorDesconto, valorTotalFinal, formaPagamento],
    function(err) {
      if (err) return res.send("Erro ao criar venda: " + err.message);
      
      const idVenda = this.lastID;
      
      const stmtItem = db.prepare(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`);
      const stmtEstoque = db.prepare(`UPDATE Produto SET estoqueAtual = estoqueAtual - ? WHERE numProduto = ?`);

      itens.forEach(item => {
        const itemSubtotal = item.qtd * item.preco;
        stmtItem.run(idVenda, item.id, item.qtd, item.preco, itemSubtotal);
        stmtEstoque.run(item.qtd, item.id);
      });

      stmtItem.finalize();
      stmtEstoque.finalize();

      res.redirect("/vendas");
    }
  );
});

module.exports = router;