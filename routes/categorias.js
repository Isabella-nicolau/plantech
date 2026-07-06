const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");
const { permitir } = require("../middlewares/auth");

// LISTAR CATEGORIAS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Categoria ORDER BY nome ASC", [], (err, rows) => {
    if (err) {
      return res.render("categorias", {
        lista: [],
        erro: "Erro ao carregar categorias: " + err.message
      });
    }
    res.render("categorias", { lista: rows, erro: null });
  });
});

// ADICIONAR CATEGORIA
router.post("/add", permitir("ADMIN"), (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return db.all("SELECT * FROM Categoria ORDER BY nome ASC", [], (err, rows) => {
      res.render("categorias", {
        lista: rows || [],
        erro: "Erro: Nome e obrigatorio."
      });
    });
  }

  db.run(
    `INSERT INTO Categoria (nome, descricao) VALUES (?, ?)`,
    [nome, descricao],
    (err) => {
      if (err) return res.send("Erro ao cadastrar categoria: " + err.message);
      registrarLog(req, "CATEGORIA_CRIADA", `Categoria "${nome}" criada`);
      res.redirect("/categorias");
    }
  );
});

// ATUALIZAR CATEGORIA
router.post("/update/:id", permitir("ADMIN"), (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.send("Erro: Nome nao pode ficar vazio.");
  }

  db.run(
    `UPDATE Categoria SET nome = ?, descricao = ? WHERE idCategoria = ?`,
    [nome, descricao, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      registrarLog(req, "CATEGORIA_EDITADA", `Categoria #${id} "${nome}" atualizada`);
      res.redirect("/categorias");
    }
  );
});

// EXCLUIR CATEGORIA
router.get("/delete/:id", permitir("ADMIN"), (req, res) => {
  db.run(`DELETE FROM Categoria WHERE idCategoria = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se ha produtos vinculados.");
    registrarLog(req, "CATEGORIA_EXCLUIDA", `Categoria #${req.params.id} excluida`);
    res.redirect("/categorias");
  });
});

module.exports = router;
