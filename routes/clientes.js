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

  // VALIDAÇÃO RELAXADA: Apenas Nome e Documento são obrigatórios
  if (!tipo || !nome || !documento) {
    return res.render("clientes", { 
      lista: [],
      erro: "Erro: Nome e CPF/CNPJ são obrigatórios." 
    });
  }

  const fantasiaFinal = (tipo === 'PJ') ? nomeFantasia : null;

  db.run(
    `INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tipo, nome, fantasiaFinal, documento, telefone, email, endereco],
    (err) => {
      if (err) return res.send("Erro ao cadastrar: " + err.message);
      res.redirect("/clientes");
    }
  );
});

router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Clientes WHERE idCliente = ?`, [req.params.id], () => res.redirect("/clientes"));
});

module.exports = router;