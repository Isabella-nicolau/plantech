const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db/database");
const { registrarLog } = require("../helpers/audit");

// LISTAR USUARIOS (nunca envia a coluna password para a view)
router.get("/", (req, res) => {
  db.all("SELECT id, username, nome, perfil, ativo FROM Usuario ORDER BY username ASC", [], (err, rows) => {
    if (err) {
      return res.render("usuarios", {
        lista: [],
        erro: "Erro ao carregar usuarios: " + err.message
      });
    }
    res.render("usuarios", { lista: rows, erro: null });
  });
});

// ADICIONAR USUARIO
router.post("/add", (req, res) => {
  const { nome, username, senha, perfil, ativo } = req.body;

  if (!username || !senha || !perfil) {
    return db.all("SELECT id, username, nome, perfil, ativo FROM Usuario ORDER BY username ASC", [], (err, rows) => {
      res.render("usuarios", {
        lista: rows || [],
        erro: "Erro: Usuario, Senha e Perfil sao obrigatorios."
      });
    });
  }

  const ativoFinal = ativo ? 1 : 0;

  bcrypt.hash(senha, 10, (errHash, hash) => {
    if (errHash) return res.send("Erro ao processar senha.");

    db.run(
      `INSERT INTO Usuario (nome, username, password, perfil, ativo) VALUES (?, ?, ?, ?, ?)`,
      [nome || null, username, hash, perfil, ativoFinal],
      (err) => {
        if (err) {
          const msg = err.message.includes("UNIQUE")
            ? "Erro: ja existe um usuario com este username."
            : "Erro ao cadastrar usuario: " + err.message;
          return res.send(msg);
        }
        registrarLog(req, "USUARIO_CRIADO", `Usuario "${username}" (${perfil}) criado`);
        res.redirect("/usuarios");
      }
    );
  });
});

// ATUALIZAR USUARIO (dados cadastrais, sem senha)
router.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nome, username, perfil, ativo } = req.body;

  if (!username || !perfil) {
    return res.send("Erro: Usuario e Perfil nao podem ficar vazios.");
  }

  const ativoFinal = ativo ? 1 : 0;

  db.run(
    `UPDATE Usuario SET nome = ?, username = ?, perfil = ?, ativo = ? WHERE id = ?`,
    [nome || null, username, perfil, ativoFinal, id],
    (err) => {
      if (err) {
        const msg = err.message.includes("UNIQUE")
          ? "Erro: ja existe um usuario com este username."
          : "Erro ao atualizar: " + err.message;
        return res.send(msg);
      }
      registrarLog(req, "USUARIO_EDITADO", `Usuario #${id} "${username}" atualizado`);
      res.redirect("/usuarios");
    }
  );
});

// REDEFINIR SENHA
router.post("/resetsenha/:id", (req, res) => {
  const { id } = req.params;
  const { novaSenha } = req.body;

  if (!novaSenha) {
    return res.send("Erro: Informe a nova senha.");
  }

  bcrypt.hash(novaSenha, 10, (errHash, hash) => {
    if (errHash) return res.send("Erro ao processar senha.");

    db.run(`UPDATE Usuario SET password = ? WHERE id = ?`, [hash, id], (err) => {
      if (err) return res.send("Erro ao redefinir senha: " + err.message);
      registrarLog(req, "USUARIO_SENHA_REDEFINIDA", `Senha do usuario #${id} redefinida`);
      res.redirect("/usuarios");
    });
  });
});

// EXCLUIR USUARIO
router.get("/delete/:id", (req, res) => {
  const { id } = req.params;

  if (req.session.user && String(req.session.user.id) === String(id)) {
    return res.send("Erro: voce nao pode excluir o proprio usuario.");
  }

  db.run(`DELETE FROM Usuario WHERE id = ?`, [id], (err) => {
    if (err) return res.send("Erro ao excluir usuario: " + err.message);
    registrarLog(req, "USUARIO_EXCLUIDO", `Usuario #${id} excluido`);
    res.redirect("/usuarios");
  });
});

module.exports = router;
