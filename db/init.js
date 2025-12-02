const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  // 1. Usuários
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Localidades (Armazenamento Físico)
  db.run(`CREATE TABLE IF NOT EXISTS Localizacao (
    idLocalizacao INTEGER PRIMARY KEY AUTOINCREMENT,
    numCorredor INTEGER NOT NULL,
    numPrateleira INTEGER NOT NULL,
    numGaveta INTEGER NOT NULL,
    capacidade TEXT,
    UNIQUE(numCorredor, numPrateleira, numGaveta)
  )`);

  // 3. Atores (Clientes e Fornecedores)
  db.run(`CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT, 
    nome TEXT NOT NULL,
    documento TEXT,
    telefone TEXT,
    email TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    telefone TEXT,
    email TEXT
  )`);

  // 4. Produto (Vinculado a uma Localização)
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    precoVenda REAL DEFAULT 0,
    estoqueAtual INTEGER DEFAULT 0,
    idLocalizacao INTEGER,
    FOREIGN KEY(idLocalizacao) REFERENCES Localizacao(idLocalizacao)
  )`);

  // 5. Compras (Entradas)
  db.run(`CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    idFornecedor INTEGER,
    idProduto INTEGER,
    quantidade INTEGER NOT NULL,
    precoCusto REAL,
    dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // 6. Distribuição (Logística Interna - Regra LIFO)
  db.run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    idCompra INTEGER,
    status TEXT DEFAULT 'PENDENTE', -- PENDENTE, ARMAZENADO
    FOREIGN KEY(idCompra) REFERENCES Compras(idCompra)
  )`);

  // 7. Entregas (Saídas)
  db.run(`CREATE TABLE IF NOT EXISTS Entregas (
    idEntrega INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER,
    idProduto INTEGER,
    quantidade INTEGER NOT NULL,
    dataEntrega DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // Criar Admin Padrão
  const senha = "admin";
  bcrypt.hash(senha, 10, (err, hash) => {
    if (!err) {
      db.run(`INSERT OR IGNORE INTO Usuario (username, password) VALUES (?, ?)`, ["admin", hash]);
    }
  });
});

console.log("Banco de dados inicializado com sucesso!");