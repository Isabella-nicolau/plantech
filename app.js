const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { autenticado, permitir } = require("./middlewares/auth");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
  secret: process.env.SESSION_SECRET || "plantech_secret_key",
  resave: false,
  saveUninitialized: false
}));

// Expor dados do usuario para todas as views
app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  next();
});

// --- Rotas Publicas ---
app.use("/login", require("./routes/login"));
app.get("/", (req, res) => {
  res.render("index");
});

// --- Rotas Protegidas ---
// ADMIN + OPERADOR
app.use("/dashboard", autenticado, require("./routes/dashboard"));
app.use("/clientes", autenticado, require("./routes/clientes"));
app.use("/vendas", autenticado, require("./routes/vendas"));

// Somente ADMIN
app.use("/produtos", autenticado, permitir("ADMIN"), require("./routes/produtos"));
app.use("/fornecedores", autenticado, permitir("ADMIN"), require("./routes/fornecedores"));
app.use("/compras", autenticado, permitir("ADMIN"), require("./routes/compras"));
app.use("/relatorios", autenticado, permitir("ADMIN"), require("./routes/relatorios"));
app.use("/auditoria", autenticado, permitir("ADMIN"), require("./routes/auditoria"));

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Plantech rodando em http://localhost:${port}`));
}

module.exports = app;
