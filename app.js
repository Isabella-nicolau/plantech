require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { autenticado, permitir } = require("./middlewares/auth");
const initDb = require("./db/init");
const { formatBRL } = require("./utils/format");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.locals.formatBRL = formatBRL;

app.use(session({
  secret: process.env.SESSION_SECRET || "plantech_dev_fallback",
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  next();
});

// --- Rotas Publicas ---
app.use("/login", require("./routes/login"));
app.use("/api", require("./routes/api"));
app.get("/", (req, res) => {
  res.render("index");
});

// --- Rotas Protegidas ---
app.use("/dashboard", autenticado, require("./routes/dashboard"));
app.use("/clientes", autenticado, require("./routes/clientes"));
app.use("/vendas", autenticado, require("./routes/vendas"));
app.use("/ordens", autenticado, require("./routes/ordens"));

app.use("/categorias", autenticado, require("./routes/categorias"));
app.use("/servicos", autenticado, require("./routes/servicos"));
app.use("/funcionarios", autenticado, permitir("ADMIN"), require("./routes/funcionarios"));
app.use("/usuarios", autenticado, permitir("ADMIN"), require("./routes/usuarios"));
app.use("/produtos", autenticado, permitir("ADMIN"), require("./routes/produtos"));
app.use("/fornecedores", autenticado, permitir("ADMIN"), require("./routes/fornecedores"));
app.use("/compras", autenticado, permitir("ADMIN"), require("./routes/compras"));
app.use("/relatorios", autenticado, require("./routes/relatorios"));
app.use("/auditoria", autenticado, permitir("ADMIN"), require("./routes/auditoria"));
app.use("/admin/seed", autenticado, permitir("ADMIN"), require("./routes/seed"));

const port = process.env.PORT || 3000;

if (require.main === module) {
  initDb()
    .then(() => {
      app.listen(port, () => console.log(`Plantech rodando em http://localhost:${port}`));
    })
    .catch((err) => {
      console.error("Falha ao inicializar o banco:", err);
      process.exit(1);
    });
}

module.exports = app;
