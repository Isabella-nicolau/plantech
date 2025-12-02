const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM Clientes", [], (err, rows) => {
    if (err) {
      return res.render("clientes", {
        lista: [],
        erro: "Erro ao carregar clientes: " + err.message
      });
    }

    res.render("clientes", { lista: rows, erro: null });
  });
});

// ADICIONAR
router.post("/add", (req, res) => {
  const { tipo, nome, documento, telefone, email } = req.body;

  if (!tipo || !nome || !documento)
    return res.send("Preencha os campos obrigatórios.");

  db.run(
    `INSERT INTO Clientes (tipo, nome, documento, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [tipo, nome, documento, telefone, email],
    (err) => {
      if (err) return res.send("Erro ao cadastrar cliente.");
      res.redirect("/clientes");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Clientes WHERE idCliente=?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir cliente.");
    res.redirect("/clientes");
  });
});

module.exports = router;
