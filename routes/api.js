const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db/database");
const { gerarToken, validarToken } = require("../middlewares/jwt");
const { registrarLog } = require("../helpers/audit");

// POST /api/login — retorna JWT
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ erro: "Usuario e senha sao obrigatorios." });
  }

  db.get("SELECT * FROM Usuario WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ erro: "Erro interno." });
    if (!user) return res.status(401).json({ erro: "Credenciais invalidas." });

    bcrypt.compare(password, user.password, (err, ok) => {
      if (!ok) return res.status(401).json({ erro: "Credenciais invalidas." });

      const token = gerarToken(user);
      registrarLog(req, "API_LOGIN", `Token gerado para "${username}"`);
      res.json({ token, usuario: { id: user.id, username: user.username, perfil: user.perfil } });
    });
  });
});

// GET /api/produtos — lista protegida por token
router.get("/produtos", validarToken, (req, res) => {
  db.all("SELECT * FROM Produto ORDER BY nomeProduto ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar produtos." });
    res.json(rows);
  });
});

module.exports = router;
