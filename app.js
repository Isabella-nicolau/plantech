const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Rotas
app.use("/localidades", require("./routes/localidades"));
app.use("/produtos", require("./routes/produtos"));
app.use("/compras", require("./routes/compras"));
app.use("/distribuicao", require("./routes/distribuicao"));
app.use("/entrega", require("./routes/entrega"));
app.use("/precos", require("./routes/precos"));

app.get("/", (req, res) => {
  res.render("index");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));

const session = require("express-session");

app.use(session({
  secret: "segredo_plantech",
  resave: false,
  saveUninitialized: false
}));

function auth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

app.use("/login", require("./routes/login"));
app.use("/localidades", auth, require("./routes/localidades"));
app.use("/produtos", auth, require("./routes/produtos"));
app.use("/compras", auth, require("./routes/compras"));
app.use("/distribuicao", auth, require("./routes/distribuicao"));
app.use("/entrega", auth, require("./routes/entrega"));
app.use("/precos", auth, require("./routes/precos"));
app.use("/clientes", auth, require("./routes/clientes"));
app.use("/fornecedores", auth, require("./routes/fornecedores"));

app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

