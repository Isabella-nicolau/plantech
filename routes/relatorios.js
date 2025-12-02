const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Função auxiliar para datas
const getDatas = (query) => {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDia = new Date().toISOString().split('T')[0];
  
  return {
    inicio: query.dataInicio || primeiroDia,
    fim: query.dataFim || ultimoDia
  };
};

// 1. RELATÓRIO DE VENDAS
router.get("/", (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  let sql = `
    SELECT v.idVenda, v.dataVenda, v.valorTotal, c.nome as nomeCliente,
           GROUP_CONCAT(p.nomeProduto || ' (' || i.quantidade || ')', ', ') as listaProdutos
    FROM Vendas v
    JOIN Clientes c ON v.idCliente = c.idCliente
    JOIN ItensVenda i ON v.idVenda = i.idVenda
    JOIN Produto p ON i.idProduto = p.numProduto
    WHERE date(v.dataVenda) BETWEEN ? AND ?
    GROUP BY v.idVenda ORDER BY v.dataVenda DESC
  `;
  db.all(sql, [inicio, fim], (err, rows) => {
    const totalGeral = rows ? rows.reduce((acc, row) => acc + row.valorTotal, 0) : 0;
    res.render("relatorios", { lista: rows || [], totalGeral, erro: err ? err.message : null, query: { dataInicio: inicio, dataFim: fim } });
  });
});

// 2. RELATÓRIO DE ESTOQUE
router.get("/estoque", (req, res) => {
  db.all(`SELECT * FROM Produto ORDER BY estoqueAtual ASC`, [], (err, rows) => {
    const totalItens = rows ? rows.length : 0;
    const itensZerados = rows ? rows.filter(p => p.estoqueAtual === 0).length : 0;
    const valorPatrimonial = rows ? rows.reduce((acc, p) => acc + (p.estoqueAtual * p.precoVenda), 0) : 0;
    res.render("relatorios_estoque", { 
      lista: rows || [], 
      stats: { totalItens, itensZerados, valorPatrimonial }, 
      erro: null 
    });
  });
});

// 3. RELATÓRIO DE SAÍDAS
router.get("/saidas", (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  const sqlLista = `
    SELECT i.idItem, v.dataVenda, p.nomeProduto, p.categoria, c.nome as nomeCliente, i.quantidade 
    FROM ItensVenda i
    JOIN Vendas v ON i.idVenda = v.idVenda
    JOIN Produto p ON i.idProduto = p.numProduto
    JOIN Clientes c ON v.idCliente = c.idCliente
    WHERE date(v.dataVenda) BETWEEN ? AND ?
    ORDER BY v.dataVenda DESC
  `;
  const sqlRanking = `
    SELECT p.nomeProduto, SUM(i.quantidade) as totalQtd 
    FROM ItensVenda i JOIN Vendas v ON i.idVenda = v.idVenda JOIN Produto p ON i.idProduto = p.numProduto
    WHERE date(v.dataVenda) BETWEEN ? AND ? GROUP BY p.numProduto ORDER BY totalQtd DESC LIMIT 5
  `;
  db.all(sqlLista, [inicio, fim], (err, lista) => {
    db.all(sqlRanking, [inicio, fim], (err2, ranking) => {
      res.render("relatorios_saidas", { lista: lista||[], ranking: ranking||[], erro: null, query: { dataInicio: inicio, dataFim: fim } });
    });
  });
});

// 4. RELATÓRIO FINANCEIRO (AQUI ESTAVA O PROBLEMA PROVAVELMENTE)
router.get("/financeiro", (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  const sqlReceitas = `SELECT SUM(valorTotal) as total FROM Vendas WHERE date(dataVenda) BETWEEN ? AND ?`;
  const sqlDespesas = `SELECT SUM(valorTotal) as total FROM Compras WHERE date(dataCompra) BETWEEN ? AND ?`;

  db.get(sqlReceitas, [inicio, fim], (err, rowRec) => {
    db.get(sqlDespesas, [inicio, fim], (err2, rowDesp) => {
      // Garante que stats nunca seja undefined
      const receitas = (rowRec && rowRec.total) ? rowRec.total : 0;
      const despesas = (rowDesp && rowDesp.total) ? rowDesp.total : 0;
      const lucro = receitas - despesas;

      res.render("relatorios_financeiro", {
        stats: { receitas, despesas, lucro }, // Envia o objeto stats corretamente
        erro: null,
        query: { dataInicio: inicio, dataFim: fim }
      });
    });
  });
});

module.exports = router;