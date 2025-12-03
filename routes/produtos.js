const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR
router.get("/", (req, res) => {
  db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", [], (err, produtos) => {
    if (err) return res.render("produtos", { lista: [], erro: err.message });
    res.render("produtos", { lista: produtos || [], erro: null });
  });
});

// ADICIONAR (Agora com Estoque Inicial)
router.post("/add", (req, res) => {
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !categoria || !precoVenda) {
    return res.send("Erro: Nome, Categoria e Preço são obrigatórios.");
  }

  // Se o estoque não for informado, grava 0
  const estoqueFinal = estoqueAtual ? parseInt(estoqueAtual) : 0;

  db.run(
    `INSERT INTO Produto (nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual) 
     VALUES (?, ?, ?, ?, ?, ?)`, 
    [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueFinal], 
    (err) => {
      if (err) return res.send("Erro ao cadastrar: " + err.message);
      res.redirect("/produtos");
    }
  );
});

// EXCLUIR
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Produto WHERE numProduto = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique movimentações.");
    res.redirect("/produtos");
  });
});

// NOVA ROTA: ATUALIZAR
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  db.run(
    `UPDATE Produto SET nomeProduto=?, descricao=?, categoria=?, unidadeMedida=?, precoVenda=?, estoqueAtual=? WHERE numProduto=?`,
    [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual, id],
    (err) => res.redirect("/produtos")
  );
});
// ...

module.exports = router;