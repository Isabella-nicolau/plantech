const jwt = require("jsonwebtoken");
const db = require("../db/database");

const JWT_SECRET = process.env.JWT_SECRET || "plantech_jwt_fallback";

function gerarToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, perfil: user.perfil },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function validarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token nao fornecido." });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ erro: "Token invalido ou expirado." });
  }

  db.get("SELECT ativo FROM Usuario WHERE id = ?", [decoded.id], (err, row) => {
    if (err) return res.status(500).json({ erro: "Erro interno ao validar token." });
    if (!row || !row.ativo) return res.status(401).json({ erro: "Usuario inativo." });
    req.usuario = decoded;
    next();
  });
}

module.exports = { gerarToken, validarToken };
