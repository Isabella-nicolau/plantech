const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const queries = {
    totalProdutos: "SELECT COUNT(*) as total FROM Produto",
    totalClientes: "SELECT COUNT(*) as total FROM Clientes",
    totalFornecedores: "SELECT COUNT(*) as total FROM Fornecedores",
    esgotados: "SELECT COUNT(*) as total FROM Produto WHERE estoqueAtual = 0",
    receitaTotal: "SELECT COALESCE(SUM(valorTotal), 0) as total FROM Vendas",
    despesaTotal: "SELECT COALESCE(SUM(valorTotal), 0) as total FROM Compras",
    vendasRecentes: `SELECT v.idVenda, v.dataVenda, v.valorTotal, v.formaPagamento, c.nome as nomeCliente
                     FROM Vendas v JOIN Clientes c ON v.idCliente = c.idCliente
                     ORDER BY v.dataVenda DESC LIMIT 5`,
    estoqueBaixo: `SELECT nomeProduto, estoqueAtual, unidadeMedida, categoria
                   FROM Produto WHERE estoqueAtual <= 10 AND estoqueAtual > 0
                   ORDER BY estoqueAtual ASC LIMIT 5`
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach(key => {
    const method = key === 'vendasRecentes' || key === 'estoqueBaixo' ? 'all' : 'get';
    db[method](queries[key], [], (err, row) => {
      results[key] = err ? (method === 'all' ? [] : { total: 0 }) : row;
      completed++;
      if (completed === keys.length) {
        res.render("dashboard", {
          user: req.session.user,
          stats: {
            totalProdutos: results.totalProdutos.total,
            totalClientes: results.totalClientes.total,
            totalFornecedores: results.totalFornecedores.total,
            esgotados: results.esgotados.total,
            receita: results.receitaTotal.total,
            despesa: results.despesaTotal.total,
            lucro: results.receitaTotal.total - results.despesaTotal.total
          },
          vendasRecentes: results.vendasRecentes,
          estoqueBaixo: results.estoqueBaixo
        });
      }
    });
  });
});

module.exports = router;
