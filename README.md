# 🌱 Plantech ERP - Carrapicho Jardinagem

![Badge Finalizado](http://img.shields.io/static/v1?label=STATUS&message=FINALIZADO&color=GREEN&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

> **Projeto de Estágio Supervisionado I** | Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas - UMFG.

---

## 📌 Sobre o Projeto

O **Plantech** é um sistema ERP (Enterprise Resource Planning) desenvolvido sob medida para atender às necessidades de gestão da **Carrapicho Jardinagem**.

O objetivo foi informatizar os processos de almoxarifado, vendas e compras que antes eram manuais, garantindo controle de estoque em tempo real, rastreabilidade de produtos e inteligência financeira. O sistema conta com uma interface moderna (Dark Premium) e algoritmos de logística interna.

### 🎯 Soluções Implementadas (Requisitos Funcionais)

* **RF1 - Gestão de Clientes:** Cadastro completo de Pessoa Física e Jurídica.
* **RF2 - Gestão de Fornecedores:** Controle de parceiros para abastecimento.
* **RF3 - Catálogo de Produtos:** Registro detalhado com categorias, unidades e controle de estoque.
* **RF4 - PDV (Ponto de Venda):** Sistema de caixa com carrinho de compras, cálculo automático e baixa imediata de estoque.
* **RF5 - Registro de Compras:** Entrada de Notas Fiscais com atualização automática de saldo e geração de tarefas logísticas.
* **RF6, RF8, RF9 - Business Intelligence:** Relatórios gerenciais de Vendas, Fluxo de Saídas e Balanço Financeiro (DRE Simplificado).
* **RF7 - Controle de Estoque:** Monitoramento visual de níveis de estoque com alertas de reposição.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Node.js + Express
* **Banco de Dados:** SQLite3 (Relacional com Foreign Keys)
* **Frontend:** EJS (Engine de Visualização) + Bootstrap 5 (Customizado - Dark Mode)
* **Segurança:** Autenticação de usuários com Hash de senha (Bcrypt)
* **Design:** Interface responsiva e intuitiva focada em UX.

---

## 📸 Screenshots

*(Sugestão: Adicione prints das telas aqui para valorizar o projeto)*

| Dashboard | Ponto de Venda (PDV) |
|:---:|:---:|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard+Plantech) | ![PDV](https://via.placeholder.com/400x200?text=Tela+de+Vendas) |

---

## 📦 Como Rodar o Projeto

Pré-requisitos: Ter o **Node.js** instalado na máquina.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Isabella-nicolau/plantech.git](https://github.com/Isabella-nicolau/plantech.git)
    cd plantech
    ```

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

---

## 👨‍💻 Autores

Projeto desenvolvido pela equipe técnica para a disciplina de Estágio Supervisionado I.

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/Isabella-nicolau">
        <img src="https://ui-avatars.com/api/?name=Isabella+Nicolau&background=2e7d32&color=fff&size=100" width="100px;" alt="Foto da Isabella"/><br>
        <sub><b>Isabella Maria Nicolau da Silva</b></sub>
      </a><br>
      <span>RA: 1896</span>
    </td>
    <td align="center">
      <a href="#">
        <img src="https://ui-avatars.com/api/?name=Gabriel+Andrade&background=1b5e20&color=fff&size=100" width="100px;" alt="Foto do Gabriel"/><br>
        <sub><b>Gabriel Figueiredo Andrade</b></sub>
      </a><br>
      <span>RA: 1766</span>
    </td>
  </tr>
</table>

**Instituição:** UMFG - Centro Universitário  
**Ano:** 2025  
**Orientador:** Prof. Me. Guilherme Dias Vicentini

---
*Desenvolvido com 💚 para a Carrapicho Jardinagem.*