const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

console.log("🌱 Inicializando Banco de Dados Plantech...");

db.serialize(() => {
  // --- 1. CRIAÇÃO DAS TABELAS ---

  // Usuários
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Clientes
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

  // Fornecedores
  db.run(`CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    endereco TEXT
  )`);

  // Produtos
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    unidadeMedida TEXT,
    precoVenda REAL DEFAULT 0,
    estoqueAtual INTEGER DEFAULT 0
  )`);

  // Compras (Cabeçalho)
  db.run(`CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    idFornecedor INTEGER,
    dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valorTotal REAL,
    FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor)
  )`);

  // Itens da Compra
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

  // Distribuição (Logística)
  db.run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    idItemCompra INTEGER,
    status TEXT DEFAULT 'PENDENTE',
    FOREIGN KEY(idItemCompra) REFERENCES ItensCompra(idItem)
  )`);

  // Vendas (Cabeçalho)
  db.run(`CREATE TABLE IF NOT EXISTS Vendas (
    idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER,
    dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL,
    desconto REAL,
    valorTotal REAL,
    formaPagamento TEXT,
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente)
  )`);

  // Itens da Venda
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

  // --- 2. INSERÇÃO DE DADOS MOCKADOS (SEED) ---

  db.get("SELECT count(*) as qtd FROM Usuario", (err, row) => {
    if (row.qtd === 0) {
      console.log("📦 Banco vazio detectado. Inserindo dados de exemplo...");

      // A. Admin
      bcrypt.hash("admin", 10, (err, hash) => {
        db.run(`INSERT INTO Usuario (username, password) VALUES (?, ?)`, ["admin", hash]);
      });

      // B. Clientes (5 registros)
      const clientes = [
        ['PF', 'João da Silva', null, '123.456.789-00', '(44) 99999-1111', 'joao@gmail.com', 'Rua das Flores, 123'],
        ['PF', 'Maria Oliveira', null, '987.654.321-11', '(44) 98888-2222', 'maria@hotmail.com', 'Av. Brasil, 500'],
        ['PJ', 'Condomínio Solar', 'Residencial Solar', '12.345.678/0001-90', '(44) 3030-4040', 'adm@solar.com.br', 'Rua Pará, 80'],
        ['PJ', 'Construtora Forte', 'Forte Engenharia', '98.765.432/0001-10', '(44) 3232-5050', 'compras@forte.com.br', 'Av. Maranhão, 1000'],
        ['PF', 'Pedro Sampaio', null, '456.123.789-44', '(44) 97777-3333', 'pedro@uol.com.br', 'Rua Ipiranga, 45']
      ];
      clientes.forEach(c => db.run(`INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco) VALUES (?,?,?,?,?,?,?)`, c));

      // C. Fornecedores (4 registros)
      const fornecedores = [
        ['Holambra Flores', '11.111.111/0001-11', '(19) 3802-1000', 'vendas@holambra.com', 'Sitio Holanda, SP'],
        ['NutriPlan Fertilizantes', '22.222.222/0001-22', '(41) 3333-4444', 'contato@nutriplan.com.br', 'Distrito Industrial, PR'],
        ['Tramontina Ferramentas', '33.333.333/0001-33', '(54) 3433-2000', 'sac@tramontina.com', 'Carlos Barbosa, RS'],
        ['Cerâmica Artistica', '44.444.444/0001-44', '(44) 3636-7070', 'vendas@ceramica.com', 'Tambóara, PR']
      ];
      fornecedores.forEach(f => db.run(`INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?,?,?,?,?)`, f));

      // D. Produtos (12 registros com estoque inicial simulado)
      const produtos = [
        ['Orquídea Phalaenopsis', 'Cor rosa, vaso p15', 'Plantas', 'UN', 45.00, 15],      // ID 1
        ['Terra Vegetal Adubada', 'Saco de 20kg', 'Insumos', 'KG', 25.00, 50],           // ID 2
        ['Vaso de Cerâmica M', 'Esmaltado azul', 'Vasos', 'UN', 38.90, 20],              // ID 3
        ['Tesoura de Poda', 'Aço inox profissional', 'Ferramentas', 'UN', 89.90, 8],     // ID 4
        ['Grama Esmeralda', 'Placa 40x60cm', 'Gramas', 'M2', 12.50, 200],                // ID 5
        ['Adubo NPK 10-10-10', 'Caixa 1kg', 'Insumos', 'CX', 18.50, 30],                 // ID 6
        ['Mangueira Flexível', '20 metros com esguicho', 'Ferramentas', 'UN', 75.00, 12], // ID 7
        ['Suculenta Mini', 'Variedades diversas', 'Plantas', 'UN', 5.00, 100],           // ID 8
        ['Pedra de Rio', 'Saco 10kg branca', 'Insumos', 'KG', 35.00, 40],                // ID 9
        ['Cachepô Madeira', 'Suspenso com corrente', 'Vasos', 'UN', 22.00, 25],          // ID 10
        ['Palmeira Real', 'Muda de 1.5m', 'Plantas', 'UN', 120.00, 5],                   // ID 11
        ['Regador Plástico', '5 Litros verde', 'Ferramentas', 'UN', 15.00, 18]           // ID 12
      ];
      produtos.forEach(p => db.run(`INSERT INTO Produto (nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual) VALUES (?,?,?,?,?,?)`, p));

      // E. Simulação de Movimentação (Compras, Vendas e Logística)
      
      // --- COMPRAS (Entradas) ---
      
      // Compra 1: Holambra (Jan/25)
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (1, 450.00, '2025-01-15 10:00:00')`, function() {
        // Itens da Compra 1
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (1, 1, 10, 25.00, 250.00)`); // Orquídeas
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (1, 'ARMAZENADO')`); // Já guardado

        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (1, 8, 40, 2.50, 100.00)`); // Suculentas
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (2, 'ARMAZENADO')`);
      });

      // Compra 2: NutriPlan (Fev/25)
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (2, 300.00, '2025-02-10 14:00:00')`, function() {
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (2, 6, 20, 15.00, 300.00)`); // Adubo
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (3, 'PENDENTE')`); // Ainda no pátio (aparecerá na tela de Logística)
      });

      // Compra 3: Tramontina (Mar/25 - Recente)
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (3, 850.00, '2025-03-05 09:30:00')`, function() {
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (3, 4, 10, 45.00, 450.00)`); // Tesouras
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (4, 'PENDENTE')`);

        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (3, 7, 10, 40.00, 400.00)`); // Mangueiras
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (5, 'PENDENTE')`);
      });


      // --- VENDAS (Saídas) ---

      // Venda 1: João (Jan/25)
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (1, 135.00, 0, 135.00, 'Pix', '2025-01-20 14:30:00')`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (1, 1, 3, 45.00, 135.00)`);
      });

      // Venda 2: Condomínio Solar (Fev/25 - Venda Grande)
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (3, 625.00, 25.00, 600.00, 'Boleto', '2025-02-15 09:00:00')`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (2, 5, 50, 12.50, 625.00)`); // Grama
      });

      // Venda 3: Maria (Mar/25)
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (2, 78.90, 0, 78.90, 'Cartão Crédito', '2025-03-01 16:45:00')`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (3, 3, 2, 38.90, 77.80)`); // Vasos
      });

      // Venda 4: Pedro (Hoje)
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (5, 45.00, 5.00, 40.00, 'Dinheiro', datetime('now'))`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (4, 12, 3, 15.00, 45.00)`); // Regadores
      });

      console.log("✅ Dados mockados inseridos com sucesso! O sistema está pronto para demonstração.");
    } else {
      console.log("ℹ️ Banco de dados já contém registros. Nenhuma alteração feita.");
    }
  });
});