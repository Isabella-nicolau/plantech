const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database.db");

console.log("🌱 Inicializando Banco de Dados Plantech");

db.serialize(() => {
  // --- 1. CRIAÇÃO DAS TABELAS (DDL AJUSTADO) ---

  // Usuários
  db.run(`CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  )`);

  // Clientes (Ajuste: Limites de caracteres definidos)
  db.run(`CREATE TABLE IF NOT EXISTS Clientes (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo VARCHAR(2) NOT NULL,         -- 'PF' ou 'PJ'
    nome VARCHAR(100) NOT NULL,       -- Nome ou Razão Social
    nomeFantasia VARCHAR(100),        -- Apenas para PJ
    documento VARCHAR(18) NOT NULL,   -- CPF (14) ou CNPJ (18)
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255)
  )`);

  // Fornecedores (Ajuste: Tipos definidos)
  db.run(`CREATE TABLE IF NOT EXISTS Fornecedores (
    idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,       -- Razão Social
    cnpj VARCHAR(18) NOT NULL,        -- Limite para CNPJ
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255)
  )`);

  // Produtos
  db.run(`CREATE TABLE IF NOT EXISTS Produto (
    numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    categoria VARCHAR(50),
    unidadeMedida VARCHAR(5),         -- Ex: UN, KG, M2
    precoVenda REAL DEFAULT 0,
    estoqueAtual INTEGER DEFAULT 0
  )`);

  // Compras - Cabeçalho
  db.run(`CREATE TABLE IF NOT EXISTS Compras (
    idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
    idFornecedor INTEGER NOT NULL,
    dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valorTotal REAL NOT NULL,
    FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor)
  )`);

  // Itens da Compra (Ajuste: Subtotal para integridade)
  db.run(`CREATE TABLE IF NOT EXISTS ItensCompra (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT, -- PK Simples (Evita chave composta)
    idCompra INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    precoCusto REAL NOT NULL,
    subtotal REAL NOT NULL,                   -- Integridade dos dados (Qtd * Custo)
    FOREIGN KEY(idCompra) REFERENCES Compras(idCompra),
    FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
  )`);

  // Distribuição (Logística)
  db.run(`CREATE TABLE IF NOT EXISTS Distribuicao (
    idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    idItemCompra INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    FOREIGN KEY(idItemCompra) REFERENCES ItensCompra(idItem)
  )`);

  // Vendas - Cabeçalho (Ajuste: 3FN com Subtotal e Total)
  db.run(`CREATE TABLE IF NOT EXISTS Vendas (
    idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
    idCliente INTEGER NOT NULL,
    dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,      -- Soma dos itens
    desconto REAL DEFAULT 0,     -- Desconto aplicado
    valorTotal REAL NOT NULL,    -- Valor Final (Subtotal - Desconto)
    formaPagamento VARCHAR(50),
    FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente)
  )`);

  // Itens da Venda (Ajuste: PK Simples)
  db.run(`CREATE TABLE IF NOT EXISTS ItensVenda (
    idItem INTEGER PRIMARY KEY AUTOINCREMENT, -- PK Simples (Correção solicitada)
    idVenda INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    precoUnitario REAL NOT NULL,
    subtotal REAL NOT NULL,                   -- Integridade (Qtd * Preço)
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

      // B. Clientes (5 registros variados)
      const clientes = [
        ['PF', 'João da Silva', null, '123.456.789-00', '(44) 99999-1111', 'joao@gmail.com', 'Rua das Flores, 123, Centro'],
        ['PF', 'Maria Oliveira', null, '987.654.321-11', '(44) 98888-2222', 'maria@hotmail.com', 'Av. Brasil, 500, Zona 02'],
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

      // D. Produtos (12 registros)
      const produtos = [
        ['Orquídea Phalaenopsis', 'Cor rosa, vaso p15', 'Plantas', 'UN', 45.00, 15],
        ['Terra Vegetal Adubada', 'Saco de 20kg', 'Insumos', 'KG', 25.00, 50],
        ['Vaso de Cerâmica M', 'Esmaltado azul', 'Vasos', 'UN', 38.90, 20],
        ['Tesoura de Poda', 'Aço inox profissional', 'Ferramentas', 'UN', 89.90, 8],
        ['Grama Esmeralda', 'Placa 40x60cm', 'Gramas', 'M2', 12.50, 200],
        ['Adubo NPK 10-10-10', 'Caixa 1kg', 'Insumos', 'CX', 18.50, 30],
        ['Mangueira Flexível', '20 metros com esguicho', 'Ferramentas', 'UN', 75.00, 12],
        ['Suculenta Mini', 'Variedades diversas', 'Plantas', 'UN', 5.00, 100],
        ['Pedra de Rio', 'Saco 10kg branca', 'Insumos', 'KG', 35.00, 40],
        ['Cachepô Madeira', 'Suspenso com corrente', 'Vasos', 'UN', 22.00, 25],
        ['Palmeira Real', 'Muda de 1.5m', 'Plantas', 'UN', 120.00, 5],
        ['Regador Plástico', '5 Litros verde', 'Ferramentas', 'UN', 15.00, 18]
      ];
      produtos.forEach(p => db.run(`INSERT INTO Produto (nomeProduto, descricao, categoria, unidadeMedida, precoVenda, estoqueAtual) VALUES (?,?,?,?,?,?)`, p));

      // E. Simulação de Movimentação
      
      // Compra 1: Holambra
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (1, 450.00, '2025-01-15 10:00:00')`, function() {
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (1, 1, 10, 25.00, 250.00)`);
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (1, 'ARMAZENADO')`);
        
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (1, 8, 40, 2.50, 100.00)`);
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (2, 'ARMAZENADO')`);
      });

      // Compra 2: NutriPlan
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (2, 300.00, '2025-02-10 14:00:00')`, function() {
        db.run(`INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (2, 6, 20, 15.00, 300.00)`);
        db.run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (3, 'PENDENTE')`);
      });

      // Venda 1: João
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (1, 135.00, 0, 135.00, 'Pix', '2025-01-20 14:30:00')`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (1, 1, 3, 45.00, 135.00)`);
      });

      // Venda 2: Condomínio Solar
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (3, 625.00, 25.00, 600.00, 'Boleto', '2025-02-15 09:00:00')`, function() {
        db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (2, 5, 50, 12.50, 625.00)`);
      });

      console.log("✅ Dados mockados inseridos com sucesso!");
    } else {
      console.log("ℹ️ Banco de dados já contém registros. Nenhuma alteração feita.");
    }
  });
});