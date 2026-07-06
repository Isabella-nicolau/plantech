const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { permitir } = require("../middlewares/auth");

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
router.get("/", permitir("ADMIN"), (req, res) => {
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
router.get("/estoque", permitir("ADMIN"), (req, res) => {
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
router.get("/saidas", permitir("ADMIN"), (req, res) => {
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
router.get("/financeiro", permitir("ADMIN"), (req, res) => {
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

// 5. RELATÓRIO DE COMPRAS POR PERIODO (RF18)
router.get("/compras", permitir("ADMIN", "OPERADOR"), (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  const sql = `
    SELECT c.idCompra, c.dataCompra, f.nome AS fornecedor, c.valorTotal
    FROM Compras c JOIN Fornecedores f ON f.idFornecedor = c.idFornecedor
    WHERE date(c.dataCompra) BETWEEN ? AND ?
    ORDER BY c.dataCompra DESC
  `;
  db.all(sql, [inicio, fim], (err, rows) => {
    const totalDespesas = rows ? rows.reduce((acc, row) => acc + row.valorTotal, 0) : 0;
    res.render("relatorios_compras", { lista: rows || [], totalDespesas, erro: err ? err.message : null, query: { dataInicio: inicio, dataFim: fim } });
  });
});

// 6. RELATÓRIO DE ORDENS DE SERVICO (RF19)
router.get("/servicos", permitir("ADMIN", "OPERADOR"), (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  const statusFiltro = req.query.status || "";

  let sql = `
    SELECT os.idOS, os.dataAbertura, os.dataConclusao, os.status,
           cl.nome AS cliente, fu.nome AS funcionario, os.valorTotal
    FROM OrdemServico os
    JOIN Clientes cl ON cl.idCliente = os.idCliente
    LEFT JOIN Funcionario fu ON fu.idFuncionario = os.idFuncionario
    WHERE date(os.dataAbertura) BETWEEN ? AND ?
  `;
  const params = [inicio, fim];
  if (statusFiltro) {
    sql += " AND os.status = ?";
    params.push(statusFiltro);
  }
  sql += " ORDER BY os.dataAbertura DESC";

  const sqlFaturamento = `
    SELECT COALESCE(SUM(valorTotal), 0) as total FROM OrdemServico
    WHERE status = 'CONCLUIDA' AND date(dataAbertura) BETWEEN ? AND ?
  `;
  const sqlRankingFuncionario = `
    SELECT fu.nome AS funcionario, COUNT(*) as totalOS, COALESCE(SUM(os.valorTotal), 0) as totalFaturado
    FROM OrdemServico os JOIN Funcionario fu ON fu.idFuncionario = os.idFuncionario
    WHERE os.status = 'CONCLUIDA' AND date(os.dataAbertura) BETWEEN ? AND ?
    GROUP BY os.idFuncionario ORDER BY totalFaturado DESC
  `;
  const sqlServicoMaisExecutado = `
    SELECT s.nome, SUM(i.quantidade) as totalQtd
    FROM ItensOrdemServico i
    JOIN OrdemServico os ON os.idOS = i.idOS
    JOIN Servico s ON s.idServico = i.idServico
    WHERE date(os.dataAbertura) BETWEEN ? AND ?
    GROUP BY i.idServico ORDER BY totalQtd DESC LIMIT 5
  `;

  db.all(sql, params, (err, lista) => {
    db.get(sqlFaturamento, [inicio, fim], (err2, rowFat) => {
      db.all(sqlRankingFuncionario, [inicio, fim], (err3, rankingFuncionarios) => {
        db.all(sqlServicoMaisExecutado, [inicio, fim], (err4, rankingServicos) => {
          res.render("relatorios_servicos", {
            lista: lista || [],
            faturamento: rowFat ? rowFat.total : 0,
            rankingFuncionarios: rankingFuncionarios || [],
            rankingServicos: rankingServicos || [],
            statusFiltro,
            erro: null,
            query: { dataInicio: inicio, dataFim: fim }
          });
        });
      });
    });
  });
});

// 7. RELATÓRIO DE CLIENTES POR FATURAMENTO (RF20)
router.get("/clientes", permitir("ADMIN", "OPERADOR"), (req, res) => {
  const { inicio, fim } = getDatas(req.query);
  const sql = `
    SELECT cl.idCliente, cl.nome,
           COALESCE((SELECT SUM(v.valorTotal) FROM Vendas v WHERE v.idCliente = cl.idCliente AND date(v.dataVenda) BETWEEN ? AND ?), 0) AS totalVendas,
           COALESCE((SELECT SUM(os.valorTotal) FROM OrdemServico os WHERE os.idCliente = cl.idCliente AND os.status = 'CONCLUIDA' AND date(os.dataAbertura) BETWEEN ? AND ?), 0) AS totalOS
    FROM Clientes cl
    ORDER BY (totalVendas + totalOS) DESC
  `;
  db.all(sql, [inicio, fim, inicio, fim], (err, rows) => {
    const lista = (rows || []).map((r) => ({ ...r, totalFaturamento: r.totalVendas + r.totalOS }));
    res.render("relatorios_clientes", { lista, erro: err ? err.message : null, query: { dataInicio: inicio, dataFim: fim } });
  });
});

module.exports = router;