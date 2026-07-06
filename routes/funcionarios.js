const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");

// LISTAR FUNCIONARIOS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Funcionario ORDER BY nome ASC", [], (err, rows) => {
    if (err) {
      return res.render("funcionarios", {
        lista: [],
        erro: "Erro ao carregar funcionarios: " + err.message
      });
    }
    res.render("funcionarios", { lista: rows, erro: null });
  });
});

// ADICIONAR FUNCIONARIO
router.post("/add", (req, res) => {
  const { nome, cargo, telefone, email, dataAdmissao, ativo } = req.body;

  if (!nome) {
    return db.all("SELECT * FROM Funcionario ORDER BY nome ASC", [], (err, rows) => {
      res.render("funcionarios", {
        lista: rows || [],
        erro: "Erro: Nome e obrigatorio."
      });
    });
  }

  const ativoFinal = ativo ? 1 : 0;

  db.run(
    `INSERT INTO Funcionario (nome, cargo, telefone, email, dataAdmissao, ativo) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, cargo, telefone, email, dataAdmissao || null, ativoFinal],
    (err) => {
      if (err) return res.send("Erro ao cadastrar funcionario: " + err.message);
      registrarLog(req, "FUNCIONARIO_CRIADO", `Funcionario "${nome}" criado`);
      res.redirect("/funcionarios");
    }
  );
});

// ATUALIZAR FUNCIONARIO
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cargo, telefone, email, dataAdmissao, ativo } = req.body;

  if (!nome) {
    return res.send("Erro: Nome nao pode ficar vazio.");
  }

  const ativoFinal = ativo ? 1 : 0;

  db.run(
    `UPDATE Funcionario SET nome = ?, cargo = ?, telefone = ?, email = ?, dataAdmissao = ?, ativo = ? WHERE idFuncionario = ?`,
    [nome, cargo, telefone, email, dataAdmissao || null, ativoFinal, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      registrarLog(req, "FUNCIONARIO_EDITADO", `Funcionario #${id} "${nome}" atualizado`);
      res.redirect("/funcionarios");
    }
  );
});

// EXCLUIR FUNCIONARIO
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Funcionario WHERE idFuncionario = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se ha ordens de servico vinculadas.");
    registrarLog(req, "FUNCIONARIO_EXCLUIDO", `Funcionario #${req.params.id} excluido`);
    res.redirect("/funcionarios");
  });
});

module.exports = router;
