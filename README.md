# Vinyl Control — Loja de Discos

Sistema web full-stack para gerenciamento do acervo e das movimentações de estoque de uma loja de discos de vinil. O projeto faz parte do simulado SAEP do curso Técnico em Desenvolvimento de Sistemas.

## Objetivo

Organizar o catálogo de discos e controlar entradas e saídas de estoque, registrando as movimentações realizadas pelos usuários e ajudando a identificar quando um produto está abaixo do estoque mínimo configurado.

## Funcionalidades

- Autenticação de usuários por e-mail e senha.
- Visualização da página principal com identificação do usuário conectado.
- Cadastro, listagem, busca, edição e exclusão de discos.
- Registro de movimentações de estoque:
  - **Entrada:** reposição ou compra de discos.
  - **Saída:** venda de discos.
- Registro da data, quantidade, usuário responsável e observação da movimentação.
- Atualização da quantidade em estoque conforme a movimentação.
- Alerta quando o estoque fica abaixo do mínimo configurado.


## Tecnologias

- **Frontend:** HTML, CSS e JavaScript.
- **Backend:** Node.js e Express.
- **ORM:** Prisma.
- **Banco de dados:** MySQL/MariaDB pelo XAMPP.
- **Testes da API:** Insomnia.
- **Controle de versão:** Git e GitHub.

## Requisitos para executar

- Node.js e npm instalados.
- XAMPP instalado.
- MySQL iniciado pelo painel do XAMPP.
- Navegador atualizado.
- Banco de dados do projeto criado no phpMyAdmin.

## Configuração do banco de dados

1. Abra o XAMPP Control Panel e inicie o **MySQL**.
2. Acesse [phpMyAdmin](http://localhost/phpmyadmin).
3. Crie o banco de dados `vinyl_control`.
4. Crie as tabelas conforme o script SQL do projeto ou sincronize-as pelo Prisma.
5. Na pasta `backend/api`, crie ou edite o arquivo `.env` e configure a conexão. Para uma instalação local padrão do XAMPP, sem senha no usuário `root`, use:

```env
DATABASE_URL="mysql://root:@localhost:3306/vinyl_control"
```

## Instalação e inicialização do backend

No terminal, entre na pasta da API:

```bash
cd backend/api
```

Instale as dependências:

```bash
npm install
```

Valide o schema e gere o cliente Prisma:

```bash
npx prisma validate
npx prisma generate
```

Se as tabelas ainda não existirem e o `schema.prisma` estiver configurado para o banco correto, sincronize o schema:

```bash
npx prisma db push
```

Inicie o servidor usando o script configurado no `package.json`, por exemplo:

```bash
npm run dev
```

## Rotas da API

Considerando que o servidor esteja rodando em `http://localhost:3000`, as rotas esperadas são:

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/usuario/cadastrar` | Cadastrar usuário, caso permitido pela implementação |
| GET | `/usuario/listar` | Listar usuários |
| GET | `/usuario/buscar/:id` | Buscar usuário por identificador |
| PUT | `/usuario/atualizar/:id` | Atualizar usuário |
| DELETE | `/usuario/excluir/:id` | Excluir usuário |

### Discos

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/disco/cadastrar` | Cadastrar disco |
| GET | `/disco/listar` | Listar discos |
| GET | `/disco/buscar/:id` | Buscar disco por identificador |
| PUT | `/disco/atualizar/:id` | Atualizar disco |
| DELETE | `/disco/excluir/:id` | Excluir disco |

### Movimentações de estoque

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/movimentacaoestoque/cadastrar` | Registrar movimentação |
| GET | `/movimentacaoestoque/listar` | Listar movimentações |
| GET | `/movimentacaoestoque/buscar/:id` | Buscar movimentação por identificador |
| PUT | `/movimentacaoestoque/atualizar/:id` | Atualizar movimentação |
| DELETE | `/movimentacaoestoque/excluir/:id` | Excluir movimentação |


## Frontend

Abra o arquivo `index.html` no navegador ou utilize a extensão Live Server do Visual Studio Code, se estiver configurada. Confirme que a URL base da API no `script.js` corresponde ao endereço e à porta usados pelo backend.

## Testes

Os testes podem ser feitos manualmente no navegador e no Insomnia:

1. Verificar se o backend inicia sem erros.
2. Confirmar que a API consegue conectar ao banco de dados.
3. Testar listagem, cadastro, edição e exclusão de discos.
4. Testar as rotas de usuários conforme os requisitos do projeto.
5. Registrar uma entrada e verificar se o estoque aumenta.
6. Registrar uma saída e verificar se o estoque diminui.
7. Verificar o comportamento ao tentar vender mais unidades do que existem.
8. Confirmar se há alerta quando o estoque fica abaixo do mínimo.
9. Verificar mensagens de erro para dados inválidos ou campos obrigatórios ausentes.

## Requisitos de infraestrutura

Preencha as versões exatas utilizadas no ambiente de desenvolvimento:

- **Sistema operacional:** Windows — versão: `informar versão`.
- **Node.js:** versão: `informar versão` (verifique com `node -v`).
- **npm:** versão: `informar versão` (verifique com `npm -v`).
- **MySQL/MariaDB do XAMPP:** versão: `informar versão`.
- **Prisma:** versão: `informar versão` (verifique com `npx prisma -v`).
- **Navegador:** Google Chrome ou outro navegador atualizado.

## Autores

Júlia Gabrielly e Gabriela Caroline