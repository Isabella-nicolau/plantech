const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

console.log("⏳ Iniciando criação do banco de dados...");

db.serialize(() => {
  // 1. Usuários
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Atores
  db.run(`CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    nome TEXT NOT NULL,
    nomeFantasia TEXT,
    documento TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    endereco TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    endereco TEXT
  )`);

  // 3. Produto
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    unidadeMedida TEXT,
    precoVenda REAL DEFAULT 0,
    estoqueAtual INTEGER DEFAULT 0
  )`);

  // 4. Compras (Cabeçalho)
  db.run(`CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    idFornecedor INTEGER,
    dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valorTotal REAL,
    FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor)
  )`);

  // 5. Itens da Compra
  db.run(`CREATE TABLE IF NOT EXISTS ItensCompra (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT,
    idCompra INTEGER,
    idProduto INTEGER,
    quantidade INTEGER NOT NULL,
    precoCusto REAL,
    subtotal REAL,
    FOREIGN KEY(idCompra) REFERENCES Compras(idCompra),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // 6. Distribuição
  db.run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    idItemCompra INTEGER,
    status TEXT DEFAULT 'PENDENTE',
    FOREIGN KEY(idItemCompra) REFERENCES ItensCompra(idItem)
  )`);

  // 7. Vendas (Cabeçalho)
  db.run(`CREATE TABLE IF NOT EXISTS Vendas (
    idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER,
    dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valorTotal REAL,
    formaPagamento TEXT,
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente)
  )`);

  // 8. Itens da Venda
  db.run(`CREATE TABLE IF NOT EXISTS ItensVenda (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT,
    idVenda INTEGER,
    idProduto INTEGER,
    quantidade INTEGER,
    precoUnitario REAL,
    subtotal REAL,
    FOREIGN KEY(idVenda) REFERENCES Vendas(idVenda),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // CRIAÇÃO DO USUÁRIO ADMIN (Fundamental para o Login)
  const senha = "admin";
  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
      console.error("Erro ao gerar hash da senha:", err);
      return;
    }
    
    db.run(
      `INSERT OR IGNORE INTO Usuario (username, password) VALUES (?, ?)`,
      ["admin", hash],
      (err) => {
        if (err) {
          console.error("Erro ao criar usuário admin:", err);
        } else {
          console.log("✅ Usuário 'admin' criado/verificado com sucesso!");
          console.log("👉 Login: admin | Senha: admin");
        }
      }
    );
  });
});