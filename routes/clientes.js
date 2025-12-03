const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  db.all("SELECT * FROM Clientes ORDER BY nome ASC", [], (err, rows) => {
    if (err) return res.render("clientes", { lista: [], erro: err.message });
    res.render("clientes", { lista: rows, erro: null });
  });
});

router.post("/add", (req, res) => {
  const { tipo, nome, nomeFantasia, documento, telefone, email, endereco } = req.body;
  if (!nome || !documento) return res.send("Nome e Documento obrigatórios.");
  
  db.run(
    `INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tipo, nome, nomeFantasia, documento, telefone, email, endereco],
    (err) => {
      if (err) return res.send("Erro: " + err.message);
      res.redirect("/clientes");
    }
  );
});

// NOVA ROTA: ATUALIZAR
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { tipo, nome, nomeFantasia, documento, telefone, email, endereco } = req.body;

  db.run(
    `UPDATE Clientes SET tipo=?, nome=?, nomeFantasia=?, documento=?, telefone=?, email=?, endereco=? WHERE idCliente=?`,
    [tipo, nome, nomeFantasia, documento, telefone, email, endereco, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      res.redirect("/clientes");
    }
  );
});

router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Clientes WHERE idCliente = ?`, [req.params.id], () => res.redirect("/clientes"));
});

module.exports = router;