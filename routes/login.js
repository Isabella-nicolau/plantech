const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

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
      console.log("Usuário não encontrado.");
      return res.render("login", { erro: "Usuário não encontrado." });
    }

    bcrypt.compare(password, user.password, (err, ok) => {
      if (!ok) {
        console.log("Senha incorreta.");
        return res.render("login", { erro: "Senha incorreta." });
      }

      console.log("Login realizado com sucesso!");
      req.session.user = user;
      res.redirect("/dashboard");
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;