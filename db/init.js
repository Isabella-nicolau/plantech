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

function all(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function addColunaSeNaoExiste(tabela, definicaoColuna) {
  const nomeColuna = definicaoColuna.trim().split(/\s+/)[0];
  const colunas = await all(`PRAGMA table_info(${tabela})`);
  const jaExiste = colunas.some((c) => c.name === nomeColuna);
  if (!jaExiste) {
    await run(`ALTER TABLE ${tabela} ADD COLUMN ${definicaoColuna}`);
  }
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
    dataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    idUsuario INTEGER,
    acao VARCHAR(50) NOT NULL,
    detalhe VARCHAR(255),
    ip VARCHAR(100),
    FOREIGN KEY(idUsuario) REFERENCES Usuario(id)
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

  await run(`CREATE TABLE IF NOT EXISTS Vendas (
    idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER NOT NULL,
    dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    desconto REAL DEFAULT 0,
    tipoDesconto VARCHAR(1) NOT NULL DEFAULT 'V',
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

  // RF13 - Categorias de produto
  await run(`CREATE TABLE IF NOT EXISTS Categoria (
    idCategoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(255)
  )`);

  // RF14 - Servicos prestados
  await run(`CREATE TABLE IF NOT EXISTS Servico (
    idServico INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    preco REAL NOT NULL DEFAULT 0,
    duracaoEstimada INTEGER,
    ativo INTEGER NOT NULL DEFAULT 1
  )`);

  // RF15 - Funcionarios
  await run(`CREATE TABLE IF NOT EXISTS Funcionario (
    idFuncionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(100),
    dataAdmissao DATE,
    ativo INTEGER NOT NULL DEFAULT 1
  )`);

  // RF17 - Ordem de Servico (movimento) + itens
  await run(`CREATE TABLE IF NOT EXISTS OrdemServico (
    idOS INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER NOT NULL,
    idFuncionario INTEGER,
    dataAbertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    dataAgendada DATE,
    dataConclusao DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    valorTotal REAL NOT NULL DEFAULT 0,
    observacao VARCHAR(255),
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente),
    FOREIGN KEY(idFuncionario) REFERENCES Funcionario(idFuncionario)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS ItensOrdemServico (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT,
    idOS INTEGER NOT NULL,
    idServico INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    precoUnitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(idOS) REFERENCES OrdemServico(idOS),
    FOREIGN KEY(idServico) REFERENCES Servico(idServico)
  )`);

  // --- Colunas novas (idempotente) ---
  await addColunaSeNaoExiste("Vendas", "tipoDesconto VARCHAR(1) NOT NULL DEFAULT 'V'");
  await addColunaSeNaoExiste("Produto", "idCategoria INTEGER REFERENCES Categoria(idCategoria)");
  await addColunaSeNaoExiste("Usuario", "nome VARCHAR(100)");
  await addColunaSeNaoExiste("Usuario", "ativo INTEGER NOT NULL DEFAULT 1");

  // --- Seed: categorias padrao ---
  await run(`INSERT OR IGNORE INTO Categoria (idCategoria, nome) VALUES
    (1,'Plantas'),(2,'Gramas'),(3,'Vasos'),(4,'Insumos'),(5,'Ferramentas')`);

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
