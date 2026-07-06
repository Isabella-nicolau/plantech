const db = require("../db/database");

function autenticado(req, res, next) {
  if (!req.session || !req.session.user) return res.redirect("/login");

  db.get("SELECT ativo FROM Usuario WHERE id = ?", [req.session.user.id], (err, row) => {
    if (err) return res.status(500).send("Erro interno ao validar sessao.");
    if (!row || !row.ativo) {
      return req.session.destroy(() => res.redirect("/login?erro=Usuario inativo. Contate o administrador."));
    }
    next();
  });
}

function permitir(...perfis) {
  return function (req, res, next) {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }
    const perfilUsuario = req.session.user.perfil || "OPERADOR";
    if (perfis.includes(perfilUsuario)) {
      return next();
    }
    res.status(403).render("erro403", { user: req.session.user });
  };
}

module.exports = { autenticado, permitir };
