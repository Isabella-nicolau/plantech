const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

function registrarLog(req, acao, detalhe) {
  const user = req.session && req.session.user;
  const idUsuario = user ? user.id : null;
  const usuario = user ? user.username : "anonimo";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

  db.run(
    `INSERT INTO LogAuditoria (idUsuario, usuario, acao, detalhe, ip) VALUES (?, ?, ?, ?, ?)`,
    [idUsuario, usuario, acao, detalhe, ip]
  );
}

module.exports = { registrarLog };
