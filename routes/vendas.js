const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// TELA DE VENDAS (PDV)
router.get("/", (req, res) => {
  // Captura mensagem de sucesso da URL (se houver)
  const msgSucesso = req.query.sucesso ? "Venda registrada com sucesso!" : null;

  db.all("SELECT * FROM Clientes ORDER BY nome ASC", (err, clientes) => {
    db.all("SELECT * FROM Produto WHERE estoqueAtual > 0 ORDER BY nomeProduto ASC", (err, produtos) => {
      
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
          erro: null,
          sucesso: msgSucesso // Envia a mensagem para a view
        });
      });
    });
  });
});

// PROCESSAR VENDA
router.post("/add", (req, res) => {
  const { idCliente, formaPagamento, desconto, itensCarrinho } = req.body;
  let itens;

  try {
    itens = JSON.parse(itensCarrinho);
  } catch (e) {
    return res.send("Erro técnico: Carrinho inválido.");
  }

  if (!idCliente || !itens || itens.length === 0) {
    return res.send("Erro: Selecione cliente e produtos.");
  }

  const valorDesconto = parseFloat(desconto) || 0;
  const subtotalGeral = itens.reduce((acc, item) => acc + (item.qtd * item.preco), 0);
  const valorTotalFinal = Math.max(0, subtotalGeral - valorDesconto);

  db.serialize(() => {
    // 1. Cria a Venda
    db.run(
      `INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento) VALUES (?, ?, ?, ?, ?)`,
      [idCliente, subtotalGeral, valorDesconto, valorTotalFinal, formaPagamento],
      function(err) {
        if (err) return res.send("Erro ao criar venda: " + err.message);
        
        const idVenda = this.lastID;
        
        // 2. Insere Itens e Baixa Estoque
        itens.forEach(item => {
          const itemSubtotal = item.qtd * item.preco;
          
          db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`, 
            [idVenda, item.id, item.qtd, item.preco, itemSubtotal]);
          
          db.run(`UPDATE Produto SET estoqueAtual = estoqueAtual - ? WHERE numProduto = ?`, 
            [item.qtd, item.id]);
        });

        // REDIRECIONA COM SUCESSO
        res.redirect("/vendas?sucesso=true");
      }
    );
  });
});

// ROTA DO COMPROVANTE
router.get("/comprovante/:id", (req, res) => {
  const id = req.params.id;
  
  const sqlVenda = `
    SELECT v.*, c.nome as nomeCliente, c.documento as docCliente, c.endereco as endCliente
    FROM Vendas v
    JOIN Clientes c ON v.idCliente = c.idCliente
    WHERE v.idVenda = ?
  `;

  const sqlItens = `
    SELECT i.*, p.nomeProduto, p.unidadeMedida
    FROM ItensVenda i
    JOIN Produto p ON i.idProduto = p.numProduto
    WHERE i.idVenda = ?
  `;

  db.get(sqlVenda, [id], (err, venda) => {
    if(err || !venda) return res.status(404).json({ error: "Venda não encontrada" });
    
    db.all(sqlItens, [id], (err2, itens) => {
      if(err2) return res.status(500).json({ error: "Erro ao buscar itens" });
      res.json({ venda, itens });
    });
  });
});

module.exports = router;