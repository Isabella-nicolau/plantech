const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => res.render("login", { erro: null }));

router.post("/", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM Usuario WHERE username = ?`, [username], (err, user) => {
    if (!user) return res.render("login", { erro: "Usuário não encontrado" });
    bcrypt.compare(password, user.password, (err, ok) => {
      if (!ok) return res.render("login", { erro: "Senha incorreta" });
      req.session.user = user;
      res.redirect("/dashboard");
    });
  });
});

router.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));
module.exports = router;