const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// LISTAR PRODUTOS (COM BUSCA)
router.get("/", (req, res) => {
  const busca = req.query.busca;
  let sql = "SELECT * FROM Produto";
  let params = [];

  // Se o usuário digitou algo, filtra
  if (busca) {
    sql += " WHERE nomeProduto LIKE ? OR categoria LIKE ? OR descricao LIKE ?";
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  sql += " ORDER BY nomeProduto ASC";

  db.all(sql, params, (err, produtos) => {
    if (err) {
      return res.render("produtos", { 
        lista: [], 
        erro: "Erro ao carregar produtos: " + err.message,
        busca: busca // Envia o termo para manter no input
      });
    }
    res.render("produtos", { 
      lista: produtos, 
      erro: null,
      busca: busca // Envia o termo para manter no input
    });
  });
});

// ADICIONAR PRODUTO
router.post("/add", (req, res) => {
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !categoria || !precoVenda) {
    return db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", [], (err, produtos) => {
      res.render("produtos", { 
        lista: produtos || [],
        erro: "Erro: Nome, Categoria e Preço são obrigatórios.",
        busca: null
      });
    });
  }

  const estoqueFinal = estoqueAtual ? parseInt(estoqueAtual) : 0;

  db.run(
    `INSERT INTO Produto (nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual) 
     VALUES (?, ?, ?, ?, ?, ?)`, 
    [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueFinal], 
    (err) => {
      if (err) return res.send("Erro ao cadastrar produto: " + err.message);
      res.redirect("/produtos");
    }
  );
});

// ATUALIZAR PRODUTO
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !precoVenda) {
    return res.send("Erro: Nome e Preço não podem ficar vazios na edição.");
  }

  db.run(
    `UPDATE Produto 
     SET nomeProduto = ?, descricao = ?, categoria = ?, unidadeMedida = ?, precoVenda = ?, estoqueAtual = ? 
     WHERE numProduto = ?`,
    [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual, id],
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      res.redirect("/produtos");
    }
  );
});

// EXCLUIR PRODUTO
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Produto WHERE numProduto = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se há vendas ou compras vinculadas.");
    res.redirect("/produtos");
  });
});

module.exports = router;