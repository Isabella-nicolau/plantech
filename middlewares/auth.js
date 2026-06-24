function autenticado(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect("/login");
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
