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
  const { tipo, nome, documento, telefone, email } = req.body;
  
  if (!nome || !documento) return res.send("Nome e Documento são obrigatórios.");

  db.run(
    `INSERT INTO Clientes (tipo, nome, documento, telefone, email) VALUES (?, ?, ?, ?, ?)`,
    [tipo, nome, documento, telefone, email],
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