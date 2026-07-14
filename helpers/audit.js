const db = require("../db/database");

function registrarLog(req, acao, detalhe) {
  const user = req.session && req.session.user;
  const idUsuario = user ? user.id : null;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

  db.run(
    `INSERT INTO LogAuditoria (idUsuario, acao, detalhe, ip) VALUES (?, ?, ?, ?)`,
    [idUsuario, acao, detalhe, ip]
  );
}

module.exports = { registrarLog };
