# Plantech ERP

Sistema ERP para gestao de estoque, vendas e financeiro da empresa Carrapicho Jardinagem.
Desenvolvido como trabalho de Estagio Supervisionado.

## Stack

- **Back-end:** Node.js + Express
- **Views:** EJS + CSS (tema dark premium com Bootstrap 5)
- **Banco:** SQLite 3
- **Auth:** express-session + bcrypt + JWT
- **Testes:** Jest + Supertest (unitario/integracao) + Playwright (E2E)
- **Upload:** Multer + Supabase Storage (opcional)
- **API externa:** BrasilAPI (consulta CNPJ)

## Como rodar

```bash
# 1. Clonar e instalar
git clone <url-do-repo>
cd plantech-main
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env
# Edite o .env com seus segredos

# 3. Criar o banco de dados
npm run initdb

# 4. Iniciar o servidor
npm start
# Acesse http://localhost:3000
```

## Variaveis de ambiente (.env)

| Variavel | Descricao | Obrigatoria |
|---|---|---|
| `SESSION_SECRET` | Segredo para cookies de sessao | Sim |
| `JWT_SECRET` | Segredo para tokens JWT | Sim |
| `PORT` | Porta do servidor (padrao: 3000) | Nao |
| `SUPABASE_URL` | URL do projeto Supabase | Nao* |
| `SUPABASE_KEY` | Anon key do Supabase | Nao* |
| `SUPABASE_BUCKET` | Nome do bucket (padrao: produtos) | Nao* |

*Sem Supabase, imagens ficam em `public/uploads/` (local).

## Usuarios de teste

| Usuario | Senha | Perfil | Acesso |
|---|---|---|---|
| `admin` | `admin` | ADMIN | Acesso total |
| `vendedor` | `vendedor` | OPERADOR | Dashboard, Clientes, Vendas |

## Rodar os testes

```bash
# Unitario + Integracao (Jest)
npm test

# E2E (Playwright — requer servidor rodando)
npm start &
npm run test:e2e
```

## Rotas da API (JWT)

```bash
# Obter token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Listar produtos (autenticado)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/produtos
```

## Estrutura do projeto

```
plantech-main/
├── app.js                 # Entrada principal (Express)
├── db/init.js             # Criacao e seed do banco SQLite
├── helpers/
│   ├── audit.js           # registrarLog() para auditoria
│   └── upload.js          # Multer + Supabase Storage
├── middlewares/
│   ├── auth.js            # autenticado(), permitir(...perfis)
│   └── jwt.js             # gerarToken(), validarToken()
├── routes/
│   ├── api.js             # POST /api/login, GET /api/produtos
│   ├── auditoria.js       # Tela de auditoria (ADMIN)
│   ├── clientes.js
│   ├── compras.js
│   ├── dashboard.js       # Dashboard com KPIs reais
│   ├── fornecedores.js    # Inclui consulta CNPJ (BrasilAPI)
│   ├── login.js
│   ├── produtos.js        # Inclui upload de imagem
│   ├── relatorios.js
│   └── vendas.js          # Validacao de estoque
├── views/
│   ├── partials/          # sidebar, topbar, head (EJS)
│   ├── auditoria.ejs
│   ├── erro403.ejs
│   └── ...demais views
├── public/
│   ├── style.css          # Design system premium
│   └── app.js             # JS client-side (theme, sidebar, validacao)
├── tests/
│   ├── calculo.test.js    # Teste unitario
│   ├── integration.test.js # Teste integracao (Jest+Supertest)
│   └── e2e.spec.js        # Teste E2E (Playwright)
├── .env.example
├── .gitignore
└── playwright.config.js
```

## Heuristicas de Nielsen aplicadas

1. **Visibilidade do status** — Feedback de sucesso/erro com alertas visuais auto-dismiss
2. **Correspondencia com o mundo real** — Linguagem clara em portugues
3. **Controle e liberdade** — Botao Cancelar em todos os formularios
4. **Consistencia e padroes** — Mesmo padrao de botoes/cores/layout em todas as telas
5. **Prevencao de erros** — Validacao de estoque no PDV (client e server-side)
6. **Reconhecimento em vez de lembranca** — Sidebar com icones e labels sempre visivel
7. **Flexibilidade e eficiencia** — Atalhos (busca, filtros, consulta CNPJ)
8. **Design estetico e minimalista** — Interface dark premium sem poluicao
9. **Ajudar a reconhecer e recuperar erros** — Mensagens claras ("Estoque insuficiente para X")
10. **Ajuda e documentacao** — Placeholders, hints, empty states orientativos

## Deploy

Para deploy no Render:
- Build command: `npm install && node db/init.js`
- Start command: `npm start`
- Variaveis de ambiente: configurar no painel do Render
- **Nota:** SQLite usa disco efemero no Render free tier. Para producao,
  migrar para PostgreSQL ou usar disco persistente.

## Tabelas do banco

Usuario, Clientes, Fornecedores, Produto, Compras, ItensCompra,
Distribuicao, Vendas, ItensVenda, LogAuditoria (10 tabelas).
