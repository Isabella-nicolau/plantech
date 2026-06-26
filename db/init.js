const db = require("./database");
const bcrypt = require("bcrypt");

function run(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params || [], function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params || [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDb() {
  console.log("Inicializando banco de dados Plantech...");

  // --- Tabelas ---
  await run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'OPERADOR'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS LogAuditoria (
    idLog INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario INTEGER,
    usuario VARCHAR(50),
    acao VARCHAR(50) NOT NULL,
    detalhe TEXT,
    ip VARCHAR(45),
    dataHora DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(2) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nomeFantasia VARCHAR(100),
    documento VARCHAR(18) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    categoria VARCHAR(50),
    unidadeMedida VARCHAR(5),
    precoVenda REAL DEFAULT 0,
    estoqueAtual INTEGER DEFAULT 0,
    imagemUrl VARCHAR(255)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    idFornecedor INTEGER NOT NULL,
    dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valorTotal REAL NOT NULL,
    FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ItensCompra (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT,
    idCompra INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    precoCusto REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(idCompra) REFERENCES Compras(idCompra),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    idItemCompra INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    FOREIGN KEY(idItemCompra) REFERENCES ItensCompra(idItem)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS Vendas (
    idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER NOT NULL,
    dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    desconto REAL DEFAULT 0,
    valorTotal REAL NOT NULL,
    formaPagamento VARCHAR(50),
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ItensVenda (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT,
    idVenda INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    precoUnitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(idVenda) REFERENCES Vendas(idVenda),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // --- Seed: usuarios ---
  const adminExists = await get("SELECT id FROM Usuario WHERE username = 'admin'");
  if (!adminExists) {
    const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin", 10);
    await run("INSERT OR IGNORE INTO Usuario (username, password, perfil) VALUES (?, ?, 'ADMIN')", ["admin", adminPass]);
    console.log("Usuario admin criado.");
  }

  const vendedorExists = await get("SELECT id FROM Usuario WHERE username = 'vendedor'");
  if (!vendedorExists) {
    const vendedorPass = await bcrypt.hash(process.env.VENDEDOR_PASSWORD || "vendedor", 10);
    await run("INSERT OR IGNORE INTO Usuario (username, password, perfil) VALUES (?, ?, 'OPERADOR')", ["vendedor", vendedorPass]);
    console.log("Usuario vendedor criado.");
  }

  console.log("Banco de dados pronto.");
}

module.exports = initDb;

if (require.main === module) {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
  initDb()
    .then(() => { console.log("Init concluido."); process.exit(0); })
    .catch((err) => { console.error("Erro no init:", err); process.exit(1); });
}
