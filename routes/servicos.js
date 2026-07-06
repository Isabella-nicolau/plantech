const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");
const { permitir } = require("../middlewares/auth");

// LISTAR SERVICOS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Servico ORDER BY nome ASC", [], (err, rows) => {
    if (err) {
      return res.render("servicos", {
        lista: [],
        erro: "Erro ao carregar servicos: " + err.message
      });
    }
    res.render("servicos", { lista: rows, erro: null });
  });
});

// ADICIONAR SERVICO
router.post("/add", permitir("ADMIN"), (req, res) => {
  const { nome, descricao, preco, duracaoEstimada, ativo } = req.body;

  if (!nome || !preco) {
    return db.all("SELECT * FROM Servico ORDER BY nome ASC", [], (err, rows) => {
      res.render("servicos", {
        lista: rows || [],
        erro: "Erro: Nome e Preco sao obrigatorios."
      });
    });
  }

  const ativoFinal = ativo ? 1 : 0;

  db.run(
    `INSERT INTO Servico (nome, descricao, preco, duracaoEstimada, ativo) VALUES (?, ?, ?, ?, ?)`,
    [nome, descricao, preco, duracaoEstimada || null, ativoFinal],
    (err) => {
      if (err) return res.send("Erro ao cadastrar servico: " + err.message);
      registrarLog(req, "SERVICO_CRIADO", `Servico "${nome}" criado`);
      res.redirect("/servicos");
    }
  );
});

// ATUALIZAR SERVICO
router.post("/update/:id", permitir("ADMIN"), (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, duracaoEstimada, ativo } = req.body;

  if (!nome || !preco) {
    return res.send("Erro: Nome e Preco nao podem ficar vazios.");
  }

  const ativoFinal = ativo ? 1 : 0;

  db.run(
    `UPDATE Servico SET nome = ?, descricao = ?, preco = ?, duracaoEstimada = ?, ativo = ? WHERE idServico = ?`,
    [nome, descricao, preco, duracaoEstimada || null, ativoFinal, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      registrarLog(req, "SERVICO_EDITADO", `Servico #${id} "${nome}" atualizado`);
      res.redirect("/servicos");
    }
  );
});

// EXCLUIR SERVICO
router.get("/delete/:id", permitir("ADMIN"), (req, res) => {
  db.run(`DELETE FROM Servico WHERE idServico = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se ha ordens de servico vinculadas.");
    registrarLog(req, "SERVICO_EXCLUIDO", `Servico #${req.params.id} excluido`);
    res.redirect("/servicos");
  });
});

module.exports = router;
