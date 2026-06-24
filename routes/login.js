const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");
const { registrarLog } = require("../helpers/audit");

// Tela de Login
router.get("/", (req, res) => {
  res.render("login", { erro: null });
});

// Processar Login
router.post("/", (req, res) => {
  const { username, password } = req.body;
  
  console.log(`Tentativa de login: ${username}`); // Log para debug no terminal

  db.get(`SELECT * FROM Usuario WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.render("login", { erro: "Erro interno no sistema." });
    }

    if (!user) {
      registrarLog(req, "LOGIN_FALHA", `Usuario "${username}" nao encontrado`);
      return res.render("login", { erro: "Usuário não encontrado." });
    }

    bcrypt.compare(password, user.password, (err, ok) => {
      if (!ok) {
        registrarLog(req, "LOGIN_FALHA", `Senha incorreta para "${username}"`);
        return res.render("login", { erro: "Senha incorreta." });
      }

      req.session.user = user;
      registrarLog(req, "LOGIN_OK", `Usuario "${username}" autenticado`);
      res.redirect("/dashboard");
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  const username = req.session.user ? req.session.user.username : "desconhecido";
  registrarLog(req, "LOGOUT", `Usuario "${username}" saiu`);
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;