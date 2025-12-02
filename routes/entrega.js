const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR ENTREGAS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Entregas", [], (err, rows) => {
    if (err) {
      return res.render("entrega", {
        lista: [],
        erro: "Erro ao carregar entregas: " + err.message
      });
    }

    res.render("entrega", { lista: rows, erro: null });
  });
});

// ADICIONAR ENTREGA
router.post("/add", (req, res) => {
  const { destinatario, produto, quantidade, endereco } = req.body;

  if (!destinatario || !produto || !quantidade || !endereco) {
    return res.send("Todos os campos são obrigatórios.");
  }

  db.run(
    `INSERT INTO Entregas (destinatario, produto, quantidade, endereco)
     VALUES (?, ?, ?, ?)`,
    [destinatario, produto, quantidade, endereco],
    (err) => {
      if (err) return res.send("Erro ao registrar entrega.");
      res.redirect("/entrega");
    }
  );
});

// EXCLUIR ENTREGA
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM Entregas WHERE idEntrega = ?`,
    [id],
    (err) => {
      if (err) return res.send("Erro ao excluir entrega.");
      res.redirect("/entrega");
    }
  );
});

module.exports = router;
