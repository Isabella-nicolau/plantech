const db = require("./database");

const MARCADOR = "[DEMO]";

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
    db.get(sql, params || [], (err, row) => (err ? reject(err) : resolve(row)));
  });
}

// Relatorios filtram por padrao "do dia 1 do mes atual ate hoje" (ver
// getDatas() em routes/relatorios.js). Para os dados aparecerem sem o
// usuario precisar mexer no filtro de data (essencial numa apresentacao
// ao vivo), toda data gerada fica sempre dentro dessa janela, seja qual
// for o dia do mes em que o seed for executado. clampDias() resolve o
// deslocamento bruto (que pode ser grande) para um numero de dias real
// dentro do mes; os offsets derivados (agendada/conclusao) devem partir
// sempre do valor ja resolvido, nunca do bruto, para preservar a ordem
// cronologica (conclusao nunca antes da abertura).
const MAX_DIAS_ATRAS = Math.max(new Date().getDate() - 1, 0);

function clampDias(diasBrutos) {
  return MAX_DIAS_ATRAS > 0 ? diasBrutos % (MAX_DIAS_ATRAS + 1) : 0;
}

function dataAtras(dias, horas, minutos) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(horas || 10, minutos || 0, 0, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

async function jaSeedado() {
  const row = await get(`SELECT COUNT(*) as total FROM OrdemServico WHERE observacao LIKE '${MARCADOR}%'`);
  return row.total > 0;
}

async function seedDemo() {
  if (await jaSeedado()) {
    return { jaSeedado: true };
  }

  const resumo = {};

  // --- Fornecedores ---
  const fornecedoresDados = [
    ["Viveiro Verde Vida", "12345678000101"],
    ["Agro Insumos Parana", "23456789000112"],
    ["Jardim & Cia Distribuidora", "34567890000123"],
    ["EcoVasos Ceramica", "45678901000134"],
    ["Ferramentas ProJardim", "56789012000145"],
  ];
  const idsFornecedores = [];
  for (const [nome, cnpj] of fornecedoresDados) {
    const r = await run(
      `INSERT INTO Fornecedores (nome, cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)`,
      [nome, cnpj, "(44) 3255-" + (1000 + idsFornecedores.length), nome.toLowerCase().replace(/[^a-z]/g, "") + "@fornecedor.com", "Rondon - PR"]
    );
    idsFornecedores.push(r.lastID);
  }
  resumo.fornecedores = idsFornecedores.length;

  // --- Clientes ---
  const clientesDados = [
    ["PF", "Mariana Costa", null, "11122233344"],
    ["PF", "Roberto Alves", null, "22233344455"],
    ["PJ", "Condominio Jardim das Flores", "Cond. Jardim das Flores", "12345678000199"],
    ["PF", "Juliana Pereira", null, "33344455566"],
    ["PJ", "Escritorio Verde Ltda", "Escritorio Verde", "23456789000188"],
    ["PF", "Carlos Eduardo", null, "44455566677"],
    ["PF", "Fernanda Lima", null, "55566677788"],
    ["PJ", "Hotel Fazenda Bela Vista", "Hotel Bela Vista", "34567890000177"],
    ["PF", "Ana Beatriz", null, "66677788899"],
    ["PJ", "Restaurante Raizes", "Restaurante Raizes", "45678901000166"],
  ];
  const idsClientes = [];
  for (const [tipo, nome, fantasia, doc] of clientesDados) {
    const r = await run(
      `INSERT INTO Clientes (tipo, nome, nomeFantasia, documento, telefone, email, endereco) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tipo, nome, fantasia, doc, "(44) 9" + (9000 + idsClientes.length) + "-0000", nome.toLowerCase().replace(/[^a-z]/g, "") + "@cliente.com", "Rondon - PR"]
    );
    idsClientes.push(r.lastID);
  }
  resumo.clientes = idsClientes.length;

  // --- Produtos (usa Categoria ja semeada: 1 Plantas, 2 Gramas, 3 Vasos, 4 Insumos, 5 Ferramentas) ---
  const produtosDados = [
    ["Muda de Ipe Amarelo", 1, "Plantas", "UN", 28.9, 34],
    ["Suculenta Echeveria", 1, "Plantas", "UN", 15.5, 60],
    ["Samambaia", 1, "Plantas", "UN", 22.0, 18],
    ["Grama Esmeralda", 2, "Gramas", "M2", 9.9, 4],
    ["Grama Sao Carlos", 2, "Gramas", "M2", 11.5, 0],
    ["Vaso Ceramica Grande", 3, "Vasos", "UN", 45.0, 22],
    ["Vaso Plastico Medio", 3, "Vasos", "UN", 18.9, 48],
    ["Vaso Autoirrigavel", 3, "Vasos", "UN", 39.9, 15],
    ["Adubo NPK 10-10-10 1kg", 4, "Insumos", "KG", 24.9, 40],
    ["Substrato Organico 5L", 4, "Insumos", "LT", 16.9, 55],
    ["Fertilizante Foliar 500ml", 4, "Insumos", "LT", 32.0, 8],
    ["Tesoura de Poda", 5, "Ferramentas", "UN", 49.9, 12],
    ["Regador 5L", 5, "Ferramentas", "UN", 28.0, 20],
    ["Kit Jardinagem Basico", 5, "Ferramentas", "CX", 89.9, 6],
  ];
  const idsProdutos = [];
  for (const [nome, idCat, catNome, un, preco, estoque] of produtosDados) {
    const r = await run(
      `INSERT INTO Produto (nomeProduto, descricao, categoria, idCategoria, unidadeMedida, precoVenda, estoqueAtual) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, "Produto de demonstracao", catNome, idCat, un, preco, estoque]
    );
    idsProdutos.push({ id: r.lastID, preco, nome });
  }
  resumo.produtos = idsProdutos.length;

  // --- Servicos ---
  const servicosDados = [
    ["Poda de Arvores", "Poda tecnica de arvores e arbustos", 120.0, 90],
    ["Manutencao de Jardim Mensal", "Manutencao periodica completa", 250.0, 180],
    ["Paisagismo Completo", "Projeto e execucao de paisagismo", 1500.0, 480],
    ["Plantio de Grama (m2)", "Plantio e preparo de solo para grama", 18.0, 60],
    ["Instalacao de Irrigacao", "Instalacao de sistema de irrigacao automatica", 600.0, 240],
    ["Adubacao e Tratamento", "Adubacao e tratamento fitossanitario", 80.0, 45],
  ];
  const idsServicos = [];
  for (const [nome, desc, preco, duracao] of servicosDados) {
    const r = await run(
      `INSERT INTO Servico (nome, descricao, preco, duracaoEstimada, ativo) VALUES (?, ?, ?, ?, 1)`,
      [nome, desc, preco, duracao]
    );
    idsServicos.push({ id: r.lastID, preco, nome });
  }
  resumo.servicos = idsServicos.length;

  // --- Funcionarios ---
  const funcionariosDados = [
    ["Joao Pereira", "Jardineiro"],
    ["Marcos Souza", "Paisagista"],
    ["Beatriz Ramos", "Jardineira"],
    ["Lucas Fernandes", "Tecnico de Irrigacao"],
    ["Patricia Gomes", "Supervisora"],
  ];
  const idsFuncionarios = [];
  for (const [nome, cargo] of funcionariosDados) {
    const r = await run(
      `INSERT INTO Funcionario (nome, cargo, telefone, email, dataAdmissao, ativo) VALUES (?, ?, ?, ?, ?, 1)`,
      [nome, cargo, "(44) 9" + (8000 + idsFuncionarios.length) + "-0000", nome.toLowerCase().replace(/[^a-z]/g, "") + "@plantech.com", dataAtras(400).slice(0, 10)]
    );
    idsFuncionarios.push(r.lastID);
  }
  resumo.funcionarios = idsFuncionarios.length;

  // --- Compras (historico financeiro, backdated) ---
  let totalCompras = 0;
  for (let i = 0; i < 7; i++) {
    const idFornecedor = idsFornecedores[i % idsFornecedores.length];
    const dias = clampDias(3 + i * 6);
    const itensQtd = 2 + (i % 2);
    const itens = [];
    let valorTotal = 0;
    for (let j = 0; j < itensQtd; j++) {
      const prod = idsProdutos[(i + j) % idsProdutos.length];
      const qtd = 5 + ((i + j) % 10);
      const custo = +(prod.preco * 0.55).toFixed(2);
      const subtotal = +(qtd * custo).toFixed(2);
      itens.push({ idProduto: prod.id, qtd, custo, subtotal });
      valorTotal += subtotal;
    }
    valorTotal = +valorTotal.toFixed(2);
    const rCompra = await run(
      `INSERT INTO Compras (idFornecedor, dataCompra, valorTotal) VALUES (?, ?, ?)`,
      [idFornecedor, dataAtras(dias, 9, 15), valorTotal]
    );
    for (const item of itens) {
      const rItem = await run(
        `INSERT INTO ItensCompra (idCompra, idProduto, quantidade, precoCusto, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [rCompra.lastID, item.idProduto, item.qtd, item.custo, item.subtotal]
      );
      await run(`INSERT INTO Distribuicao (idItemCompra, status) VALUES (?, 'CONCLUIDA')`, [rItem.lastID]);
    }
    totalCompras++;
  }
  resumo.compras = totalCompras;

  // --- Vendas (historico financeiro, backdated) ---
  const formasPagamento = ["Dinheiro", "Pix", "Cartão Crédito", "Cartão Débito"];
  let totalVendas = 0;
  for (let i = 0; i < 18; i++) {
    const idCliente = idsClientes[i % idsClientes.length];
    const dias = clampDias(1 + i * 2);
    const itensQtd = 1 + (i % 3);
    const itens = [];
    let subtotalGeral = 0;
    for (let j = 0; j < itensQtd; j++) {
      const prod = idsProdutos[(i * 2 + j) % idsProdutos.length];
      const qtd = 1 + ((i + j) % 4);
      const itemSubtotal = +(qtd * prod.preco).toFixed(2);
      itens.push({ idProduto: prod.id, qtd, preco: prod.preco, subtotal: itemSubtotal });
      subtotalGeral += itemSubtotal;
    }
    subtotalGeral = +subtotalGeral.toFixed(2);
    const desconto = i % 5 === 0 ? +(subtotalGeral * 0.05).toFixed(2) : 0;
    const valorTotal = +(subtotalGeral - desconto).toFixed(2);

    const rVenda = await run(
      `INSERT INTO Vendas (idCliente, dataVenda, subtotal, desconto, valorTotal, formaPagamento) VALUES (?, ?, ?, ?, ?, ?)`,
      [idCliente, dataAtras(dias, 8 + (i % 9), 30), subtotalGeral, desconto, valorTotal, formasPagamento[i % formasPagamento.length]]
    );
    for (const item of itens) {
      await run(
        `INSERT INTO ItensVenda (idVenda, idProduto, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [rVenda.lastID, item.idProduto, item.qtd, item.preco, item.subtotal]
      );
    }
    totalVendas++;
  }
  resumo.vendas = totalVendas;

  // --- Ordens de Servico (varios status, backdated) ---
  const statusPlano = [
    "CONCLUIDA", "CONCLUIDA", "CONCLUIDA", "CONCLUIDA", "CONCLUIDA",
    "EM_EXECUCAO", "EM_EXECUCAO",
    "ABERTA", "ABERTA", "ABERTA",
    "CANCELADA", "CANCELADA",
  ];
  let totalOS = 0;
  for (let i = 0; i < statusPlano.length; i++) {
    const status = statusPlano[i];
    const idCliente = idsClientes[(i * 3) % idsClientes.length];
    const idFuncionario = idsFuncionarios[i % idsFuncionarios.length];
    const diasAbertura = clampDias(2 + i * 4);
    const itensQtd = 1 + (i % 2);
    const itens = [];
    let valorTotal = 0;
    for (let j = 0; j < itensQtd; j++) {
      const serv = idsServicos[(i + j) % idsServicos.length];
      const qtd = 1 + (j % 2);
      const subtotal = +(qtd * serv.preco).toFixed(2);
      itens.push({ idServico: serv.id, qtd, preco: serv.preco, subtotal });
      valorTotal += subtotal;
    }
    valorTotal = +valorTotal.toFixed(2);

    const dataAbertura = dataAtras(diasAbertura, 9, 0);
    const dataAgendada = dataAtras(Math.max(diasAbertura - 3, 0)).slice(0, 10);
    const dataConclusao = status === "CONCLUIDA" ? dataAtras(Math.max(diasAbertura - 2, 0), 17, 0) : null;

    const rOS = await run(
      `INSERT INTO OrdemServico (idCliente, idFuncionario, dataAbertura, dataAgendada, dataConclusao, status, valorTotal, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [idCliente, idFuncionario, dataAbertura, dataAgendada, dataConclusao, status, valorTotal, `${MARCADOR} Atendimento de demonstracao #${i + 1}`]
    );
    for (const item of itens) {
      await run(
        `INSERT INTO ItensOrdemServico (idOS, idServico, quantidade, precoUnitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [rOS.lastID, item.idServico, item.qtd, item.preco, item.subtotal]
      );
    }
    totalOS++;
  }
  resumo.ordensServico = totalOS;

  return resumo;
}

module.exports = seedDemo;

if (require.main === module) {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
  const initDb = require("./init");
  initDb()
    .then(() => seedDemo())
    .then((resumo) => {
      if (resumo.jaSeedado) {
        console.log("Dados de demonstracao ja existem (marcados com [DEMO]). Nada foi inserido.");
      } else {
        console.log("Dados de demonstracao inseridos:", resumo);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erro ao gerar dados de demonstracao:", err);
      process.exit(1);
    });
}
