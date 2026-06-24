const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR CLIENTES (COM BUSCA)
router.get("/", (req, res) => {
  const busca = req.query.busca;
  let sql = "SELECT * FROM Clientes";
  let params = [];

  if (busca) {
    sql += " WHERE nome LIKE ? OR nomeFantasia LIKE ? OR documento LIKE ? OR email LIKE ?";
    const term = `%${busca}%`;
    params.push(term, term, term, term);
  }

  sql += " ORDER BY nome ASC";

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.render("clientes", { 
        lista: [], 
        erro: "Erro ao carregar clientes: " + err.message,
        busca: busca
      });
    }
    res.render("clientes", { 
      lista: rows, 
      erro: null,
      busca: busca
    });
  });
});

// ADICIONAR CLIENTE
router.post("/add", (req, res) => {
  const { tipo, nome, nomeFantasia, documento, telefone, email, endereco } = req.body;

  // Validação: Nome e Documento são obrigatórios
  if (!nome || !documento) {
    return db.all("SELECT * FROM Clientes ORDER BY nome ASC", [], (err, rows) => {
      res.render("clientes", { 
        lista: rows || [],
        erro: "Erro: Nome e CPF/CNPJ são obrigatórios.",
        busca: null
      });
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

// --- ROTA QUE FALTAVA: ATUALIZAR CLIENTE ---
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { tipo, nome, nomeFantasia, documento, telefone, email, endereco } = req.body;

  const fantasiaFinal = (tipo === 'PJ') ? nomeFantasia : null;

  db.run(
    `UPDATE Clientes 
     SET tipo=?, nome=?, nomeFantasia=?, documento=?, telefone=?, email=?, endereco=? 
     WHERE idCliente=?`,
    [tipo, nome, fantasiaFinal, documento, telefone, email, endereco, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      res.redirect("/clientes");
    }
  );
});

// EXCLUIR CLIENTE
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Clientes WHERE idCliente = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se há vendas vinculadas.");
    res.redirect("/clientes");
  });
});

module.exports = router;