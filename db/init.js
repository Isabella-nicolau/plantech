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

  // Verifica se já tem admin. Se não tiver, assume que o banco está vazio e popula tudo.
  db.get("SELECT count(*) as qtd FROM Usuario", (err, row) => {
    if (row.qtd === 0) {
      console.log("📦 Banco vazio detectado. Inserindo dados de exemplo...");

      // A. Admin
      bcrypt.hash("admin", 10, (err, hash) => {
        db.run(`INSERT INTO Usuario (username, password) VALUES (?, ?)`, ["admin", hash]);
      });

      // B. Clientes
      const clientes = [
        ['PF', 'João da Silva', null, '123.456.789-00', '(44) 99999-1111', 'joao@gmail.com', 'Rua das Flores, 123'],
        ['PF', 'Maria Oliveira', null, '987.654.321-11', '(44) 98888-2222', 'maria@hotmail.com', 'Av. Brasil, 500'],
        ['PJ', 'Condomínio Solar', 'Residencial Solar', '12.345.678/0001-90', '(44) 3030-4040', 'adm@solar.com.br', 'Rua Pará, 80'],
        ['PJ', 'Construtora Forte', 'Forte Engenharia', '98.765.432/0001-10', '(44) 3232-5050', 'compras@forte.com.br', 'Av. Maranhão, 1000'],
        ['PF', 'Pedro Sampaio', null, '456.123.789-44', '(44) 97777-3333', 'pedro@uol.com.br', 'Rua Ipiranga, 45']
      ];
      clientes.forEach(c => db.run(`INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco) VALUES (?,?,?,?,?,?,?)`, c));

      // C. Fornecedores
      const fornecedores = [
        ['Holambra Flores', '11.111.111/0001-11', '(19) 3802-1000', 'vendas@holambra.com', 'Sitio Holanda, SP'],
        ['NutriPlan Fertilizantes', '22.222.222/0001-22', '(41) 3333-4444', 'contato@nutriplan.com.br', 'Distrito Industrial, PR'],
        ['Tramontina Ferramentas', '33.333.333/0001-33', '(54) 3433-2000', 'sac@tramontina.com', 'Carlos Barbosa, RS'],
        ['Cerâmica Artistica', '44.444.444/0001-44', '(44) 3636-7070', 'vendas@ceramica.com', 'Tambóara, PR']
      ];
      fornecedores.forEach(f => db.run(`INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?,?,?,?,?)`, f));

      // D. Produtos (Estoque Inicial simulado)
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

      // E. Simulação de Movimentação (Compras e Vendas para Relatórios)
      // Nota: Para não complicar o script com IDs dinâmicos, vamos inserir dados fixos assumindo que os IDs acima começarão em 1.
      
      // Compra Antiga (Para gerar Despesa)
      db.run(`INSERT INTO Compras (idFornecedor, valorTotal, dataCompra) VALUES (1, 450.00, '2025-02-10 10:00:00')`); // Compra de Orquídeas
      
      // Venda Antiga (Para gerar Receita e Histórico)
      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (1, 135.00, 0, 135.00, 'Pix', '2025-02-15 14:30:00')`);
      db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (1, 1, 3, 45.00, 135.00)`); // 3 Orquídeas

      db.run(`INSERT INTO Vendas (idCliente, subtotal, desconto, valorTotal, formaPagamento, dataVenda) VALUES (3, 500.00, 50.00, 450.00, 'Boleto', '2025-02-20 09:00:00')`);
      db.run(`INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (2, 5, 40, 12.50, 500.00)`); // 40m² de Grama

      console.log("✅ Dados mockados inseridos com sucesso!");
    } else {
      console.log("ℹ️ Banco de dados já contém registros. Nenhuma alteração feita.");
    }
  });
});