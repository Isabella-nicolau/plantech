const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");
const { upload, enviarParaSupabase } = require("../helpers/upload");

function buscarCategoria(idCategoria) {
  return new Promise((resolve, reject) => {
    if (!idCategoria) return resolve(null);
    db.get("SELECT nome FROM Categoria WHERE idCategoria = ?", [idCategoria], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.nome : null);
    });
  });
}

function buscarCategorias() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Categoria ORDER BY nome ASC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// LISTAR PRODUTOS (COM BUSCA)
router.get("/", async (req, res) => {
  const busca = req.query.busca;
  let sql = "SELECT * FROM Produto";
  let params = [];

  if (busca) {
    sql += " WHERE nomeProduto LIKE ? OR categoria LIKE ? OR descricao LIKE ?";
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  sql += " ORDER BY nomeProduto ASC";

  const categorias = await buscarCategorias();

  db.all(sql, params, (err, produtos) => {
    if (err) {
      return res.render("produtos", {
        lista: [],
        categorias,
        erro: "Erro ao carregar produtos: " + err.message,
        busca: busca
      });
    }
    res.render("produtos", {
      lista: produtos,
      categorias,
      erro: null,
      busca: busca
    });
  });
});

// ADICIONAR PRODUTO
router.post("/add", upload.single("imagem"), async (req, res) => {
  const { nomeProduto, descricao, idCategoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !idCategoria || !precoVenda) {
    const [produtos, categorias] = await Promise.all([
      new Promise((resolve) => db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", [], (err, rows) => resolve(rows || []))),
      buscarCategorias()
    ]);
    return res.render("produtos", {
      lista: produtos,
      categorias,
      erro: "Erro: Nome, Categoria e Preco sao obrigatorios.",
      busca: null
    });
  }

  const estoqueFinal = estoqueAtual ? parseInt(estoqueAtual) : 0;
  const nomeCategoria = await buscarCategoria(idCategoria);
  let imagemUrl = null;

  if (req.file) {
    const cloudUrl = await enviarParaSupabase(req.file.path, req.file.filename);
    imagemUrl = cloudUrl || "/uploads/" + req.file.filename;
  }

  db.run(
    `INSERT INTO Produto (nomeProduto, descricao, categoria, idCategoria, unidadeMedida, precoVenda, estoqueAtual, imagemUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nomeProduto, descricao, nomeCategoria, idCategoria, unidadeMedida, precoVenda, estoqueFinal, imagemUrl],
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
  const { nomeProduto, descricao, idCategoria, unidadeMedida, precoVenda, estoqueAtual } = req.body;

  if (!nomeProduto || !precoVenda) {
    return res.send("Erro: Nome e Preco nao podem ficar vazios.");
  }

  const nomeCategoria = await buscarCategoria(idCategoria);
  let imagemSql = "";
  const params = [nomeProduto, descricao, nomeCategoria, idCategoria, unidadeMedida, precoVenda, estoqueAtual];

  if (req.file) {
    const cloudUrl = await enviarParaSupabase(req.file.path, req.file.filename);
    const imagemUrl = cloudUrl || "/uploads/" + req.file.filename;
    imagemSql = ", imagemUrl = ?";
    params.push(imagemUrl);
  }

  params.push(id);

  db.run(
    `UPDATE Produto
     SET nomeProduto = ?, descricao = ?, categoria = ?, idCategoria = ?, unidadeMedida = ?, precoVenda = ?, estoqueAtual = ?${imagemSql}
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
