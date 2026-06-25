const jwt = require("jsonwebtoken");

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
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token invalido ou expirado." });
  }
}

module.exports = { gerarToken, validarToken };
