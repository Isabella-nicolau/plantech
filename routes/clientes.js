const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR CLIENTES
router.get("/", (req, res) => {
  db.all("SELECT * FROM Clientes ORDER BY nome ASC", [], (err, rows) => {
    if (err) {
      return res.render("clientes", { 
        lista: [], 
        erro: "Erro ao carregar clientes: " + err.message 
      });
    }
    res.render("clientes", { lista: rows, erro: null });
  });
});

// ADICIONAR CLIENTE (RF1)
router.post("/add", (req, res) => {
  const { tipo, nome, nomeFantasia, documento, telefone, email, endereco } = req.body;

  // Validação básica
  if (!tipo || !nome || !documento || !endereco) {
    return res.render("clientes", { 
      lista: [], // Idealmente recarregar a lista aqui, mas simplificado para o exemplo
      erro: "Preencha os campos obrigatórios (Nome/Razão, Documento e Endereço)." 
    });
  }

  // Se for PF, garantimos que nomeFantasia seja vazio ou null
  const fantasiaFinal = (tipo === 'PJ') ? nomeFantasia : null;

  db.run(
    `INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tipo, nome, fantasiaFinal, documento, telefone, email, endereco],
    (err) => {
      if (err) return res.send("Erro ao cadastrar cliente: " + err.message);
      res.redirect("/clientes");
    }
  );
});

// EXCLUIR CLIENTE
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Clientes WHERE idCliente = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir: " + err.message);
    res.redirect("/clientes");
  });
});

module.exports = router;