const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR COMPRAS
router.get("/", (req, res) => {
  db.all("SELECT * FROM Compras", [], (err, rows) => {
    if (err) {
      return res.render("compras", {
        lista: [],
        erro: "Erro ao carregar compras: " + err.message
      });
    }

    res.render("compras", { lista: rows, erro: null });
  });
});


// ADICIONAR COMPRA
router.post("/add", (req, res) => {
  const { nomeProduto, quantidade, preco } = req.body;

  if (!nomeProduto || !quantidade || !preco)
    return res.send("Preencha todos os campos.");

  db.run(
    `INSERT INTO Compras (nomeProduto, quantidade, preco)
     VALUES (?, ?, ?)`,
    [nomeProduto, quantidade, preco],
    (err) => {
      if (err) return res.send("Erro ao registrar compra.");
      res.redirect("/compras");
    }
  );
});

// EXCLUIR COMPRA
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM Compras WHERE idCompra = ?`, [id], (err) => {
    if (err) return res.send("Erro ao excluir compra.");
    res.redirect("/compras");
  });
});

router.get("/", (req, res) => {
  db.all("SELECT * FROM Compras", [], (err, rows) => {
    if (err) {
      return res.render("compras", {
        lista: [],
        erro: "Erro ao carregar compras: " + err.message
      });
    }

    res.render("compras", { lista: rows, erro: null });
  });
});

module.exports = router;
