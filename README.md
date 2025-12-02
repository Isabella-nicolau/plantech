
````markdown
# 🌱 Plantech - Sistema de Gestão de Almoxarifado Inteligente

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=FINALIZADO&color=GREEN&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

> **Projeto de Estágio Supervisionado I** | Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas - UMFG.

---

## 📌 Sobre o Projeto

O **Plantech** é um sistema ERP focado na gestão logística de almoxarifados agrícolas. Diferente de sistemas comuns, ele não apenas registra entradas e saídas, mas **otimiza o fluxo de trabalho** do estoquista.

O sistema resolve o problema da desorganização física através de um **Algoritmo de Distribuição Inteligente (LIFO)**, garantindo que os produtos sejam listados para armazenamento na ordem inversa à do carregamento do carrinho, otimizando o trajeto nos corredores.

### 🎯 Diferenciais
* **Logística LIFO:** Geração automática de listas de armazenamento ordenadas por localização física (Corredor > Prateleira > Gaveta).
* **Rastreabilidade Total:** Vínculo forte entre Fornecedores, Notas Fiscais, Produtos e Clientes.
* **Controle de Estoque em Tempo Real:** Baixa automática nas vendas e incremento nas compras.
* **Interface Premium:** Design moderno, responsivo e intuitivo pensado para uso diário.

---

## 🚀 Funcionalidades

### 1. Gestão de Atores
* **Fornecedores:** Cadastro completo para rastreio de origem de mercadoria.
* **Clientes:** Suporte a Pessoa Física (CPF) e Jurídica (CNPJ) com distinção visual.

### 2. Mapeamento Físico (Almoxarifado)
* Cadastro de endereços físicos (Localidades).
* Definição de **Corredor**, **Prateleira** e **Gaveta** com capacidade de armazenamento.

### 3. Fluxo de Entrada (Compras)
* Registro de Notas de Compra vinculadas a fornecedores reais.
* Geração automática de **Pendências de Distribuição**.

### 4. Logística Interna (O Coração do Sistema)
* Tela de "Checklist" para o estoquista.
* O sistema diz **ONDE** guardar cada item recebido.
* Ordenação inteligente para reduzir tempo de caminhada no galpão.

### 5. Fluxo de Saída (Entrega/Venda)
* Seleção apenas de produtos com saldo positivo em estoque.
* Baixa automática e registro histórico da saída para o cliente.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Node.js + Express
* **Banco de Dados:** SQLite3 (Relacional com Foreign Keys)
* **Frontend:** EJS (Engine de Visualização) + Bootstrap 5 (Customizado)
* **Autenticação:** Bcrypt (Hash de senhas) + Express Session
* **Segurança:** Proteção de rotas (Middleware de Auth)

---

## 📸 Screenshots

*(Adicione aqui prints das suas telas novas. Sugestão: Crie uma pasta 'prints' e coloque as imagens lá)*

| Dashboard | Lista de Distribuição |
|:---:|:---:|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard+Premium) | ![Logistica](https://via.placeholder.com/400x200?text=Logistica+LIFO) |

---

## 📦 Como Rodar o Projeto

Pré-requisitos: Ter o **Node.js** instalado na máquina.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU-USUARIO/plantech.git](https://github.com/SEU-USUARIO/plantech.git)
   cd plantech
````

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Inicialize o Banco de Dados:**
    *Este passo cria as tabelas e o usuário administrador.*

    ```bash
    node db/init.js
    ```

4.  **Rode o Servidor:**

    ```bash
    npm start
    ```

5.  **Acesse:**
    Abra seu navegador em: `http://localhost:3000`

🔐 **Login Padrão:**

  * **Usuário:** `admin`
  * **Senha:** `admin`

-----

## 📂 Estrutura de Arquivos

```
plantech/
├── app.js              # Núcleo da aplicação
├── database.db         # Banco de dados (Gerado automaticamente)
├── db/
│   └── init.js         # Script de modelagem do banco (DDL)
├── public/
│   └── style.css       # Estilização Premium (Verde/Moderno)
├── routes/             # Controladores (Lógica de Negócio)
│   ├── compras.js      # Lógica de Entrada
│   ├── distribuicao.js # Lógica LIFO
│   └── ...
└── views/              # Telas (Frontend EJS)
    ├── dashboard.ejs
    ├── distribuicao.ejs
    └── ...
```

-----

## 👨‍💻 Autores

\<table align="center"\>
\<tr\>
\<td align="center"\>
\<a href="\#"\>
\<img src="https://www.google.com/search?q=https://ui-avatars.com/api/%3Fname%3DIsabella%2BNicolau%26background%3D2e7d32%26color%3Dfff" width="100px;" alt="Foto da Isabella"/\><br>
\<sub\>\<b\>Isabella Maria Nicolau DaSilva\</b\>\</sub\>
\</a\>
\</td\>
\<td align="center"\>
\<a href="\#"\>
\<img src="https://www.google.com/search?q=https://ui-avatars.com/api/%3Fname%3DGabriel%2BAndrade%26background%3D1b5e20%26color%3Dfff" width="100px;" alt="Foto do Gabriel"/\><br>
\<sub\>\<b\>Gabriel Andrade Figueiredo\</b\>\</sub\>
\</a\>
\</td\>
\</tr\>
\</table\>

**Orientador:** Prof. Me. Guilherme Dias Vicentini  
**Instituição:** UMFG - 2025

-----

*Feito com 💚 para revolucionar a gestão agrícola.*

```