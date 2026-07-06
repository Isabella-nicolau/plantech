const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");

function buscarOS(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM OrdemServico WHERE idOS = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// TELA DE ORDENS DE SERVICO
router.get("/", (req, res) => {
  const statusFiltro = req.query.status || "";

  db.all("SELECT * FROM Clientes ORDER BY nome ASC", (err, clientes) => {
    db.all("SELECT * FROM Servico WHERE ativo = 1 ORDER BY nome ASC", (err2, servicos) => {
      db.all("SELECT * FROM Funcionario WHERE ativo = 1 ORDER BY nome ASC", (err3, funcionarios) => {
        let sqlHist = `
          SELECT os.idOS, os.dataAbertura, os.dataAgendada, os.dataConclusao, os.status, os.valorTotal,
                 cl.nome AS nomeCliente, fu.nome AS nomeFuncionario
          FROM OrdemServico os
          JOIN Clientes cl ON cl.idCliente = os.idCliente
          LEFT JOIN Funcionario fu ON fu.idFuncionario = os.idFuncionario
        `;
        const params = [];
        if (statusFiltro) {
          sqlHist += " WHERE os.status = ?";
          params.push(statusFiltro);
        }
        sqlHist += " ORDER BY os.dataAbertura DESC";

        db.all(sqlHist, params, (err4, historico) => {
          res.render("ordens", {
            clientes: clientes || [],
            servicos: servicos || [],
            funcionarios: funcionarios || [],
            historico: historico || [],
            statusFiltro,
            erro: null
          });
        });
      });
    });
  });
});

// CRIAR ORDEM DE SERVICO
router.post("/add", (req, res) => {
  const { idCliente, idFuncionario, dataAgendada, observacao, itensCarrinho } = req.body;
  let itens;

  try {
    itens = JSON.parse(itensCarrinho);
  } catch (e) {
    return res.send("Erro nos dados dos servicos selecionados.");
  }

  if (!idCliente || !itens || itens.length === 0) {
    return res.send("Erro: Selecione um cliente e ao menos um servico.");
  }

  const valorTotal = itens.reduce((acc, item) => acc + (item.qtd * item.preco), 0);

  db.run(
    `INSERT INTO OrdemServico (idCliente, idFuncionario, dataAgendada, observacao, valorTotal, status)
     VALUES (?, ?, ?, ?, ?, 'ABERTA')`,
    [idCliente, idFuncionario || null, dataAgendada || null, observacao || null, valorTotal],
    function (err) {
      if (err) return res.send("Erro ao criar ordem de servico: " + err.message);

      const idOS = this.lastID;

      db.serialize(() => {
        itens.forEach((item) => {
          const subtotal = item.qtd * item.preco;
          db.run(
            `INSERT INTO ItensOrdemServico (idOS, idServico, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
            [idOS, item.id, item.qtd, item.preco, subtotal]
          );
        });
      });

      registrarLog(req, "OS_CRIADA", `Ordem de Servico #${idOS} R$${valorTotal.toFixed(2)} (${itens.length} servico(s))`);
      res.redirect("/ordens");
    }
  );
});

// INICIAR OS
router.get("/iniciar/:id", async (req, res) => {
  const { id } = req.params;
  const os = await buscarOS(id);

  if (!os) return res.send("Ordem de servico nao encontrada.");
  if (os.status !== "ABERTA") {
    return res.send(`Erro: so e possivel iniciar uma OS com status ABERTA (atual: ${os.status}).`);
  }

  db.run(`UPDATE OrdemServico SET status = 'EM_EXECUCAO' WHERE idOS = ?`, [id], (err) => {
    if (err) return res.send("Erro ao iniciar OS: " + err.message);
    registrarLog(req, "OS_INICIADA", `Ordem de Servico #${id} iniciada`);
    res.redirect("/ordens");
  });
});

// CONCLUIR OS
router.get("/concluir/:id", async (req, res) => {
  const { id } = req.params;
  const os = await buscarOS(id);

  if (!os) return res.send("Ordem de servico nao encontrada.");
  if (os.status === "CANCELADA" || os.status === "CONCLUIDA") {
    return res.send(`Erro: nao e possivel concluir uma OS com status ${os.status}.`);
  }

  db.run(`UPDATE OrdemServico SET status = 'CONCLUIDA', dataConclusao = CURRENT_TIMESTAMP WHERE idOS = ?`, [id], (err) => {
    if (err) return res.send("Erro ao concluir OS: " + err.message);
    registrarLog(req, "OS_CONCLUIDA", `Ordem de Servico #${id} concluida`);
    res.redirect("/ordens");
  });
});

// CANCELAR OS
router.get("/cancelar/:id", async (req, res) => {
  const { id } = req.params;
  const os = await buscarOS(id);

  if (!os) return res.send("Ordem de servico nao encontrada.");
  if (os.status === "CONCLUIDA") {
    return res.send("Erro: nao e possivel cancelar uma OS ja concluida.");
  }

  db.run(`UPDATE OrdemServico SET status = 'CANCELADA' WHERE idOS = ?`, [id], (err) => {
    if (err) return res.send("Erro ao cancelar OS: " + err.message);
    registrarLog(req, "OS_CANCELADA", `Ordem de Servico #${id} cancelada`);
    res.redirect("/ordens");
  });
});

module.exports = router;
