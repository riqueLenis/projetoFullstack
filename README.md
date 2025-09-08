# Desafio Desenvolvedor Fullstack

Este projeto é uma solução, que consiste em criar uma aplicação web completa integrando um backend em Node.js (via Next.js API Routes), um frontend em React (Next.js), um banco de dados PostgreSQL e a ferramenta de automação N8N.

## 🚀 Link para a Aplicação Online

A aplicação está disponível para teste no seguinte link:

[**COLE AQUI A URL DO SEU DEPLOY NA VERCEL**](https://COLE_AQUI_A_URL_DO_SEU_DEPLOY_NA_VERCEL)

---

## ✨ Funcionalidades

* **Fluxo de Dados Completo:** Ao clicar em "Executar", a aplicação:
    1.  Chama uma API backend.
    2.  A API busca dados de um endpoint externo.
    3.  Descriptografa esses dados utilizando o algoritmo AES.
    4.  Envia os dados limpos para um webhook do N8N.
    5.  O N8N insere os dados em um banco de dados PostgreSQL.
    6.  Retorna a lista completa de usuários do banco.
    7.  Exibe os usuários em uma tabela na interface.
* **Limpeza Dinâmica:** O botão "Limpar" aciona um segundo workflow no N8N que apaga todos os registros da tabela no banco de dados e atualiza a interface em tempo real.
* **Interface Responsiva:** O design se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (hospedado na Vercel)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Automação de Workflow:** [N8N](https://n8n.io/)
* **Deploy:** [Vercel](https://vercel.com/)