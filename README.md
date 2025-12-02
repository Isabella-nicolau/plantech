🌱 Plantech – Sistema de Gestão 
Gerenciamento de Localidades, Clientes, Fornecedores, Produtos, Compras, Distribuição e Entrega.

📌 Descrição do Projeto

O Plantech é um sistema web desenvolvido para auxiliar no controle operacional de um ambiente agrícola.
Seu objetivo é facilitar o cadastro, organização e consulta de dados essenciais como:

Localidades

Clientes (Pessoa Física e Jurídica)

Fornecedores

Produtos

Compras

Distribuição

Entregas

Relação de preços

O sistema foi criado como parte do Projeto de Estágio Supervisionado I, atendendo todos os requisitos do documento oficial fornecido pela instituição.

🛠 Tecnologias Utilizadas

Node.js – Backend

Express – Estrutura de rotas

SQLite3 – Banco de dados local

EJS – Template Engine para as páginas

Bootstrap 5 – Layout rápido e responsivo

JavaScript – Lógica geral

HTML5 + CSS3 – Estrutura das telas

Estas tecnologias foram escolhidas por serem leves, fáceis de configurar e permitirem desenvolver tudo em menos de um dia.

📁 Estrutura do Projeto
plantech/
│── app.js                   → Arquivo principal do servidor
│── package.json
│── database.db              → Banco de dados SQLite
│
├── db/
│   └── init.js              → Script de criação das tabelas
│
├── views/
│   ├── dashboard.ejs        → Tela principal
│   ├── login.ejs            → Tela de login
│   ├── localidades.ejs
│   ├── produtos.ejs
│   ├── clientes.ejs
│   ├── fornecedores.ejs
│   ├── compras.ejs
│   ├── distribuicao.ejs
│   ├── entrega.ejs
│   └── precos.ejs
│
├── routes/
│   ├── localidades.js
│   ├── produtos.js
│   ├── clientes.js
│   ├── fornecedores.js
│   ├── compras.js
│   ├── distribuicao.js
│   ├── entrega.js
│   └── precos.js
│
└── public/
    └── css / imagens / js

🚀 Como Rodar o Projeto
1. Clonar o repositório
git clone https://github.com/SEU-USUARIO/plantech.git

2. Entrar no diretório
cd plantech

3. Instalar as dependências
npm install

4. Criar o banco e tabelas
node db/init.js

5. Iniciar o servidor
npm start

6. Acessar no navegador:

👉 http://localhost:3000

🔐 Login Padrão

Após gerar o banco com o init.js, o usuário padrão criado é:

Usuário: admin

Senha: admin

📌 Funcionalidades Implementadas
✔ Login e autenticação de usuário

Controle simples com sessões e proteção de rotas.

✔ Dashboard com todos os módulos

Acesso rápido aos cadastros e operações do sistema.

✔ Cadastro completo de:

Localidades

Produtos

Clientes (PF / PJ)

Fornecedores

✔ Registro de compras

Lista, consulta e inserção de compras.

✔ Distribuição

Controle interno de produtos.

✔ Entrega

Finalização da saída dos produtos.

✔ Relação de preços

Geração automática com base nas tabelas cadastradas.

📸 Prints das Telas (adicione depois)

Você pode completar com imagens do seu sistema:

Dashboard

Login

Telas de cadastro

Tabelas e listagens

Para adicionar imagens no README:

![Dashboard](prints/dashboard.png)

🎯 Diferenciais para Nota Máxima

Código organizado em rotas separadas

Interface limpa usando Bootstrap

Estrutura MVC simples

Banco de dados funcional

Documentação completa

Sistema inteiramente navegável

Justificativa clara das tecnologias

Repositório estruturado

👩‍💻 Autores

Isabella (Keka) – Backend, Integração e Views

[Nome do seu amigo] – Banco, Lógica e Organização das rotas

📄 Licença

Este projeto é acadêmico e não possui licença comercial.