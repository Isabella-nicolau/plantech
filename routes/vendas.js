const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");
const { formatBRL } = require("../utils/format");

// TELA DE VENDAS (PDV)
router.get("/", (req, res) => {
  const msgSucesso = req.query.sucesso ? "Venda registrada com sucesso!" : null;
  const msgErro = req.query.erro || null;

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
          erro: msgErro,
          sucesso: msgSucesso
        });
      });
    });
  });
});

// PROCESSAR VENDA
router.post("/add", (req, res) => {
  const { idCliente, formaPagamento, desconto, tipoDesconto, itensCarrinho } = req.body;
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
  const tipo = tipoDesconto === "P" ? "P" : "V";
  const subtotalGeral = itens.reduce((acc, item) => acc + (item.qtd * item.preco), 0);

  if (valorDesconto < 0) {
    return res.redirect("/vendas?erro=" + encodeURIComponent("Desconto nao pode ser negativo."));
  }
  if (tipo === "P" && valorDesconto > 100) {
    return res.redirect("/vendas?erro=" + encodeURIComponent("Desconto percentual nao pode ser maior que 100%."));
  }
  if (tipo === "V" && valorDesconto > subtotalGeral) {
    return res.redirect("/vendas?erro=" + encodeURIComponent("Desconto em R$ nao pode ser maior que o subtotal."));
  }

  const valorTotalFinal = tipo === "P"
    ? Math.max(0, +(subtotalGeral - (subtotalGeral * valorDesconto / 100)).toFixed(2))
    : Math.max(0, +(subtotalGeral - valorDesconto).toFixed(2));

  // Validar estoque antes de processar
  const ids = itens.map(i => i.id);
  const placeholders = ids.map(() => "?").join(",");
  db.all(`SELECT numProduto, nomeProduto, estoqueAtual FROM Produto WHERE numProduto IN (${placeholders})`, ids, (err, produtos) => {
    if (err) return res.send("Erro ao verificar estoque.");
    const estoqueMap = {};
    produtos.forEach(p => { estoqueMap[p.numProduto] = p; });

    for (const item of itens) {
      const prod = estoqueMap[item.id];
      if (!prod) return res.send("Produto nao encontrado.");
      if (item.qtd > prod.estoqueAtual) {
        return res.redirect("/vendas?erro=Estoque insuficiente para \"" + encodeURIComponent(prod.nomeProduto) + "\". Disponivel: " + prod.estoqueAtual);
      }
    }

    db.serialize(() => {
      db.run(
      `INSERT INTO Vendas (idCliente, subtotal, desconto, tipoDesconto, valorTotal, formaPagamento) VALUES (?, ?, ?, ?, ?, ?)`,
      [idCliente, subtotalGeral, valorDesconto, tipo, valorTotalFinal, formaPagamento],
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

        registrarLog(req, "VENDA_CRIADA", `Venda #${idVenda} ${formatBRL(valorTotalFinal)} (${itens.length} itens)`);
        res.redirect("/vendas?sucesso=true");
      }
    );
    });
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