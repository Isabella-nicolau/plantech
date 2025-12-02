const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// TELA DE VENDAS (PDV)
router.get("/", (req, res) => {
  // Carrega Clientes e Produtos para os Selects
  db.all("SELECT * FROM Clientes ORDER BY nome ASC", (err, clientes) => {
    db.all("SELECT * FROM Produto WHERE estoqueAtual > 0 ORDER BY nomeProduto ASC", (err, produtos) => {
      // Carrega Histórico de Vendas
      const sqlHist = `
        SELECT v.idVenda, v.dataVenda, v.valorTotal, v.formaPagamento, c.nome as nomeCliente
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

// PROCESSAR VENDA (Recebe JSON do Frontend)
router.post("/add", (req, res) => {
  const { idCliente, formaPagamento, itensCarrinho } = req.body;
  let itens;

  try {
    itens = JSON.parse(itensCarrinho); // Converte a string JSON de volta para objeto
  } catch (e) {
    return res.send("Erro ao processar itens do carrinho.");
  }

  if (!idCliente || !itens || itens.length === 0) {
    return res.send("Erro: Venda sem cliente ou produtos.");
  }

  // 1. Calcula Total Geral
  const valorTotal = itens.reduce((acc, item) => acc + (item.qtd * item.preco), 0);

  // 2. Insere Venda (Cabeçalho)
  db.run(
    `INSERT INTO Vendas (idCliente, valorTotal, formaPagamento) VALUES (?, ?, ?)`,
    [idCliente, valorTotal, formaPagamento],
    function(err) {
      if (err) return res.send("Erro ao criar venda header: " + err.message);
      
      const idVenda = this.lastID;
      
      // 3. Processa Itens (Loop)
      const stmtItem = db.prepare(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`);
      const stmtEstoque = db.prepare(`UPDATE Produto SET estoqueAtual = estoqueAtual - ? WHERE numProduto = ?`);

      itens.forEach(item => {
        const subtotal = item.qtd * item.preco;
        
        // Grava Item
        stmtItem.run(idVenda, item.id, item.qtd, item.preco, subtotal);
        
        // Baixa Estoque (RF4: Atualização em tempo real)
        stmtEstoque.run(item.qtd, item.id);
      });

      stmtItem.finalize();
      stmtEstoque.finalize();

      res.redirect("/vendas");
    }
  );
});

// DETALHES DA VENDA (Opcional - Visualizar Itens)
router.get("/detalhes/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT i.*, p.nomeProduto 
    FROM ItensVenda i
    JOIN Produto p ON i.idProduto = p.numProduto
    WHERE i.idVenda = ?
  `;
  db.all(sql, [id], (err, rows) => {
    if(err) return res.send(err.message);
    res.send(rows); // Retorna JSON simples para conferência rápida
  });
});

module.exports = router;