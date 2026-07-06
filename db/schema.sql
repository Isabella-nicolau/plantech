-- Plantech ERP - schema de referencia (SQLite)
-- Espelha o que db/init.js cria/migra no boot da aplicacao.
-- db/init.js e a fonte de verdade (idempotente); este arquivo e apenas
-- documentacao para consulta/anexo academico.

CREATE TABLE IF NOT EXISTS Usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL DEFAULT 'OPERADOR',
  nome VARCHAR(100),
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS LogAuditoria (
  idLog INTEGER PRIMARY KEY AUTOINCREMENT,
  idUsuario INTEGER,
  usuario VARCHAR(50),
  acao VARCHAR(50) NOT NULL,
  detalhe TEXT,
  ip VARCHAR(45),
  dataHora DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Clientes (
  idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo VARCHAR(2) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nomeFantasia VARCHAR(100),
  documento VARCHAR(18) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Fornecedores (
  idFornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco VARCHAR(255)
);

-- RF13 - Categorias de produto
CREATE TABLE IF NOT EXISTS Categoria (
  idCategoria INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(50) NOT NULL,
  descricao VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Produto (
  numProduto INTEGER PRIMARY KEY AUTOINCREMENT,
  nomeProduto VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  categoria VARCHAR(50),
  unidadeMedida VARCHAR(5),
  precoVenda REAL DEFAULT 0,
  estoqueAtual INTEGER DEFAULT 0,
  imagemUrl VARCHAR(255),
  idCategoria INTEGER REFERENCES Categoria(idCategoria)
);

CREATE TABLE IF NOT EXISTS Compras (
  idCompra INTEGER PRIMARY KEY AUTOINCREMENT,
  idFornecedor INTEGER NOT NULL,
  dataCompra DATETIME DEFAULT CURRENT_TIMESTAMP,
  valorTotal REAL NOT NULL,
  FOREIGN KEY(idFornecedor) REFERENCES Fornecedores(idFornecedor)
);

CREATE TABLE IF NOT EXISTS ItensCompra (
  idItem INTEGER PRIMARY KEY AUTOINCREMENT,
  idCompra INTEGER NOT NULL,
  idProduto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  precoCusto REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY(idCompra) REFERENCES Compras(idCompra),
  FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
);

CREATE TABLE IF NOT EXISTS Distribuicao (
  idDistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
  idItemCompra INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDENTE',
  FOREIGN KEY(idItemCompra) REFERENCES ItensCompra(idItem)
);

CREATE TABLE IF NOT EXISTS Vendas (
  idVenda INTEGER PRIMARY KEY AUTOINCREMENT,
  idCliente INTEGER NOT NULL,
  dataVenda DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal REAL NOT NULL,
  desconto REAL DEFAULT 0,
  valorTotal REAL NOT NULL,
  formaPagamento VARCHAR(50),
  FOREIGN KEY(idCliente) REFERENCES Clientes(idCliente)
);

CREATE TABLE IF NOT EXISTS ItensVenda (
  idItem INTEGER PRIMARY KEY AUTOINCREMENT,
  idVenda INTEGER NOT NULL,
  idProduto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  precoUnitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY(idVenda) REFERENCES Vendas(idVenda),
  FOREIGN KEY(idProduto) REFERENCES Produto(numProduto)
);

-- RF14 - Servicos prestados
CREATE TABLE IF NOT EXISTS Servico (
  idServico INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  preco REAL NOT NULL DEFAULT 0,
  duracaoEstimada INTEGER,
  ativo INTEGER NOT NULL DEFAULT 1
);

-- RF15 - Funcionarios
CREATE TABLE IF NOT EXISTS Funcionario (
  idFuncionario INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(100) NOT NULL,
  cargo VARCHAR(50),
  telefone VARCHAR(20),
  email VARCHAR(100),
  dataAdmissao DATE,
  ativo INTEGER NOT NULL DEFAULT 1
);

-- RF17 - Ordem de Servico (movimento) + itens
CREATE TABLE IF NOT EXISTS OrdemServico (
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
);

CREATE TABLE IF NOT EXISTS ItensOrdemServico (
  idItem INTEGER PRIMARY KEY AUTOINCREMENT,
  idOS INTEGER NOT NULL,
  idServico INTEGER NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  precoUnitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY(idOS) REFERENCES OrdemServico(idOS),
  FOREIGN KEY(idServico) REFERENCES Servico(idServico)
);

-- Seed: categorias padrao
INSERT OR IGNORE INTO Categoria (idCategoria, nome) VALUES
  (1,'Plantas'),(2,'Gramas'),(3,'Vasos'),(4,'Insumos'),(5,'Ferramentas');
