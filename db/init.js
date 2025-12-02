const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  // Tabela Localização
  db.run(`CREATE TABLE IF NOT EXISTS Localizacao (
    numCorredor INTEGER NOT NULL,
    numPrateleira INTEGER NOT NULL,
    numGaveta INTEGER NOT NULL,
    capacidade TEXT NOT NULL,
    PRIMARY KEY (numCorredor, numPrateleira, numGaveta)
  )`);

  // Tabela Produto
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    numCorredor INTEGER NOT NULL,
    numPrateleira INTEGER NOT NULL,
    numGaveta INTEGER NOT NULL,
    FOREIGN KEY(numCorredor, numPrateleira, numGaveta)
      REFERENCES Localizacao(numCorredor, numPrateleira, numGaveta)
  )`);

  // Pedido
  db.run(`CREATE TABLE IF NOT EXISTS PedidoCompra (
    numPedido INTEGER PRIMARY KEY,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS PedidoItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numPedido INTEGER,
    produto INTEGER,
    quantidade INTEGER
  )`);

  // Compra
  db.run(`CREATE TABLE IF NOT EXISTS Compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numPedido INTEGER,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS CompraItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compraId INTEGER,
    produto INTEGER,
    quantidade INTEGER
  )`);
db.run(`
  CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    preco REAL NOT NULL
  );
`);

  // Distribuição
  db.run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT
  )`);

 db.run(`
  CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    produto TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    destino TEXT NOT NULL
  );
`);
db.run(`
  CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,                -- PF ou PJ
    nome TEXT NOT NULL,
    documento TEXT NOT NULL,           -- CPF/CNPJ
    telefone TEXT,
    email TEXT
  );
`);
db.run(`
  CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    telefone TEXT,
    email TEXT
  );
`);

  // Entrega
  db.run(`CREATE TABLE IF NOT EXISTS Entrega (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notaCliente TEXT,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS EntregaItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entregaId INTEGER,
    produto INTEGER,
    quantidade INTEGER
  )`);

  // Usuários
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Criar usuário admin
  const senhaPadrao = "admin";

  bcrypt.hash(senhaPadrao, 10, (err, hash) => {
    if (err) {
      console.log("Erro ao processar hash:", err);
      return;
    }

    db.run(
      `INSERT OR IGNORE INTO Usuario (username, password) VALUES (?, ?)`,
      ["admin", hash],
      (err) => {
        if (err) console.log("Erro ao criar usuário admin:", err);
        else console.log("Usuário admin criado com sucesso!");

        // SÓ FECHA O BANCO DEPOIS DA CRIAÇÃO DO USUÁRIO
        db.close();
      }
    );
  });
});
