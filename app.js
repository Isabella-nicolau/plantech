const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Configuração de Sessão
app.use(session({
  secret: "plantech_secret_key",
  resave: false,
  saveUninitialized: false
}));

// Middleware de Autenticação
function auth(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

// Rotas Públicas
app.use("/login", require("./routes/login"));
app.get("/", (req, res) => res.redirect("/dashboard"));

// Rotas Protegidas
app.use("/localidades", auth, require("./routes/localidades"));
app.use("/produtos", auth, require("./routes/produtos"));
app.use("/clientes", auth, require("./routes/clientes"));
app.use("/fornecedores", auth, require("./routes/fornecedores"));
app.use("/compras", auth, require("./routes/compras"));
app.use("/distribuicao", auth, require("./routes/distribuicao"));
app.use("/entrega", auth, require("./routes/entrega"));
app.use("/precos", auth, require("./routes/precos"));

// Dashboard
app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Plantech rodando em http://localhost:${port}`));