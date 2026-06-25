const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const db = new sqlite3.Database("./database.db");
const { registrarLog } = require("../helpers/audit");
const { upload, enviarParaSupabase } = require("../helpers/upload");

// LISTAR PRODUTOS (COM BUSCA)
router.get("/", (req, res) => {
  const busca = req.query.busca;
  let sql = "SELECT * FROM Produto";
  let params = [];

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
        busca: busca
      });
    }
    res.render("produtos", {
      lista: produtos,
      erro: null,
      busca: busca
    });
  });
});

// ADICIONAR PRODUTO
router.post("/add", upload.single("imagem"), async (req, res) => {
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !categoria || !precoVenda) {
    return db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", [], (err, produtos) => {
      res.render("produtos", {
        lista: produtos || [],
        erro: "Erro: Nome, Categoria e Preco sao obrigatorios.",
        busca: null
      });
    });
  }

  const estoqueFinal = estoqueAtual ? parseInt(estoqueAtual) : 0;
  let imagemUrl = null;

  if (req.file) {
    const cloudUrl = await enviarParaSupabase(req.file.path, req.file.filename);
    imagemUrl = cloudUrl || "/uploads/" + req.file.filename;
  }

  db.run(
    `INSERT INTO Produto (nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual, imagemUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueFinal, imagemUrl],
    (err) => {
      if (err) return res.send("Erro ao cadastrar produto: " + err.message);
      registrarLog(req, "PRODUTO_CRIADO", `Produto "${nomeProduto}" criado`);
      res.redirect("/produtos");
    }
  );
});

// ATUALIZAR PRODUTO
router.post("/update/:id", upload.single("imagem"), async (req, res) => {
  const { id } = req.params;
  const { nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !precoVenda) {
    return res.send("Erro: Nome e Preco nao podem ficar vazios.");
  }

  let imagemSql = "";
  const params = [nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual];

  if (req.file) {
    const cloudUrl = await enviarParaSupabase(req.file.path, req.file.filename);
    const imagemUrl = cloudUrl || "/uploads/" + req.file.filename;
    imagemSql = ", imagemUrl = ?";
    params.push(imagemUrl);
  }

  params.push(id);

  db.run(
    `UPDATE Produto
     SET nomeProduto = ?, descricao = ?, categoria = ?, unidadeMedida = ?, precoVenda = ?, estoqueAtual = ?${imagemSql}
     WHERE numProduto = ?`,
    params,
    (err) => {
      if (err) return res.send("Erro ao atualizar: " + err.message);
      registrarLog(req, "PRODUTO_EDITADO", `Produto #${id} "${nomeProduto}" atualizado`);
      res.redirect("/produtos");
    }
  );
});

// EXCLUIR PRODUTO
router.get("/delete/:id", (req, res) => {
  db.run(`DELETE FROM Produto WHERE numProduto = ?`, [req.params.id], (err) => {
    if (err) return res.send("Erro ao excluir. Verifique se ha vendas ou compras vinculadas.");
    registrarLog(req, "PRODUTO_EXCLUIDO", `Produto #${req.params.id} excluido`);
    res.redirect("/produtos");
  });
});

module.exports = router;
