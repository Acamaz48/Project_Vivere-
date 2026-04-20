# Workspace Monorepo VIM - Backend

## 📋 Visão Geral

Este monorepo, gerenciado com **Nx**, contém os microsserviços backend para a plataforma de gestão de eventos. Cada serviço é independente, possui seu próprio banco de dados PostgreSQL e segue uma arquitetura modular com **Prisma ORM**, **NestJS**, DTOs, repositórios e controllers.

A comunicação entre serviços é feita via API Gateway, que roteia as requisições para os microsserviços correspondentes.

---

## 🧱 Estrutura do Monorepo

```text
apps/
backend/
api-gateway/ # Gateway que expõe a API unificada
auth-service/ # Autenticação e autorização (RBAC)
identity-service/ # Gestão de organizações, pessoas, endereços
warehouse-service/ # Catálogo de itens, categorias e BOM
service-order-service/ # Ordens de serviço e itens de OS
logistics-service/ # Estoque, reservas e movimentações
libs/
shared/ # Bibliotecas compartilhadas
contracts/ # Tipos e interfaces compartilhadas
domain/ # Entidades de domínio
events/ # Definições de eventos para CDC
docker-compose.yml # Orquestração dos serviços com Docker
```

---

## 🚀 Tecnologias Utilizadas

- **Node.js** 20+
- **NestJS** 11 – Framework para construção de APIs
- **Prisma** 7 – ORM para PostgreSQL
- **PostgreSQL** 16 – Banco de dados relacional
- **Nx** 22 – Ferramenta de build e gerenciamento de monorepo
- **Docker** & **Docker Compose** – Containerização
- **Jest** – Testes unitários
- **ESLint** / **Prettier** – Linting e formatação
- **class-validator** – Validação de DTOs
- **Swagger** – Documentação automática das APIs (em cada serviço)

---

## ⚙️ Pré-requisitos

- Node.js 20+ (recomendado usar nvm)
- Docker e Docker Compose
- PostgreSQL 16 (opcional, se não usar Docker)
- Nx CLI instalada globalmente: `npm i -g nx`

---

## 🔧 Configuração Inicial

1. Clone o repositório:

   ```bash
   git clone <url>
   cd workspace-monorepo-vim
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie os arquivos de ambiente de exemplo para cada serviço (ou configure as variáveis diretamente):

   ```bash
   cp apps/backend/auth-service/.env.example apps/backend/auth-service/.env
   cp apps/backend/identity-service/.env.example apps/backend/identity-service/.env
   cp apps/backend/warehouse-service/.env.example apps/backend/warehouse-service/.env
   cp apps/backend/service-order-service/.env.example apps/backend/service-order-service/.env
   cp apps/backend/logistics-service/.env.example apps/backend/logistics-service/.env
   cp apps/backend/api-gateway/.env.example apps/backend/api-gateway/.env
   ```

4. Edite os arquivos `.env` com as configurações desejadas (hosts, portas, senhas). Para desenvolvimento local com Docker, as URLs dos bancos são as definidas no `docker-compose.yml`.

---

## 🐳 Executando com Docker Compose

A maneira mais simples de subir todos os serviços e seus bancos de dados é usando Docker Compose.

```bash
# Subir todos os containers em background
npm run docker:up

# Acompanhar logs
npm run docker:logs

# Parar todos os containers
npm run docker:down

# Reconstruir e subir
npm run docker:rebuild
```

O gateway estará disponível em `http://localhost:3000/api`. Cada serviço individual também pode ser acessado diretamente nas portas:

- auth-service: 3002
- identity-service: 3001
- warehouse-service: 3003
- service-order-service: 3004
- logistics-service: 3005

---

## 🖥️ Executando Localmente (sem Docker)

Para desenvolvimento, você pode rodar cada serviço individualmente com Nx. Certifique-se de ter o PostgreSQL rodando localmente ou use os containers apenas para os bancos.

### 1. Suba apenas os bancos de dados com Docker:

```bash
docker-compose up -d auth-db identity-db warehouse-db service-order-db logistics-db
```

### 2. Execute as migrações do Prisma para cada serviço (necessário apenas na primeira vez):

```bash
npm run prisma:migrate:dev
```

Ou, individualmente:

```bash
nx run auth-service:prisma-migrate-dev
nx run identity-service:prisma-migrate-dev
nx run warehouse-service:prisma-migrate-dev
nx run service-order-service:prisma-migrate-dev
nx run logistics-service:prisma-migrate-dev
```

### 3. Inicie os serviços desejados:

- **API Gateway** (necessário para roteamento):

  ```bash
  npm run serve:gateway
  ```

- **Auth Service**:

  ```bash
  npm run serve:auth
  ```

- **Identity Service**:

  ```bash
  npm run serve:identity
  ```

- **Warehouse Service**:

  ```bash
  npm run serve:warehouse
  ```

- **Service Order Service**:

  ```bash
  npm run serve:service-order
  ```

- **Logistics Service**:

  ```bash
  npm run serve:logistics
  ```

- **Todos os serviços em paralelo** (cada um em sua porta):

  ```bash
  npm run serve:all
  ```

---

## 📜 Scripts Disponíveis

Os scripts estão definidos no \`package.json\` raiz e podem ser executados com \`npm run <script>\`.

| Script | Descrição |
|--------|-----------|
| \`build\` | Compila todos os projetos |
| \`build:auth\`, \`build:identity\`, ... | Compila um serviço específico |
| \`serve\` | Inicia o API Gateway |
| \`serve:auth\`, \`serve:identity\`, ... | Inicia um serviço individual |
| \`serve:all\` | Inicia todos os serviços em paralelo |
| \`test\` | Executa testes de todos os projetos |
| \`lint\` | Executa linting em todos os projetos |
| \`format\` | Formata o código com Prettier |
| \`format:check\` | Verifica formatação sem alterar |
| \`clean\` | Limpa cache do Nx e node_modules/.cache |
| \`prisma:generate\` | Gera cliente Prisma para todos os serviços |
| \`prisma:migrate:dev\` | Aplica migrações em desenvolvimento (todos) |
| \`prisma:migrate:deploy\` | Aplica migrações em produção (todos) |
| \`prisma:studio:auth\`, \`...\` | Abre Prisma Studio para um serviço |
| \`docker:up\` | Sobe containers com docker-compose |
| \`docker:down\` | Derruba containers |
| \`docker:logs\` | Mostra logs dos containers |
| \`docker:rebuild\` | Reconstrói e sobe containers |
| \`prepare\` | Instala hooks do Husky (se configurado) |

---

## 🗂️ Detalhamento dos Serviços

### API Gateway (\`api-gateway\`)
- Porta: 3000
- Proxy reverso para os microsserviços.
- Rotas: \`/auth/*\`, \`/identity/*\`, \`/warehouse/*\`, \`/service-order/*\`, \`/logistics/*\`
- Health check: \`GET /health\`

### Auth Service (\`auth-service\`)
- Porta: 3002
- Tabelas: \`users\`, \`login_history\`, \`roles\`, \`user_roles\`
- Endpoints: \`/users\`, \`/login-history\`, \`/roles\`, \`/user-roles\`
- Responsável por autenticação e autorização (RBAC).

### Identity Service (\`identity-service\`)
- Porta: 3001
- Tabelas: \`organizations\`, \`persons\`, \`organization_persons\`, \`addresses\`, \`consents\`
- Endpoints: \`/organizations\`, \`/persons\`, \`/organization-persons\`, \`/addresses\`, \`/consents\`
- Gerencia entidades (pessoas, empresas) e consentimentos LGPD.

### Warehouse Service (\`warehouse-service\`)
- Porta: 3003
- Tabelas: \`categories\`, \`items\`, \`bom\`
- Endpoints: \`/categories\`, \`/items\`, \`/bom\`
- Catálogo de itens, categorias e estrutura de produtos (BOM).

### Service Order Service (\`service-order-service\`)
- Porta: 3004
- Tabelas: \`orders\`, \`order_items\`
- Endpoints: \`/orders\`, \`/order-items\`
- Ordens de serviço, incluindo itens próprios e de terceiros.

### Logistics Service (\`logistics-service\`)
- Porta: 3005
- Tabelas: \`addresses\`, \`locations\`, \`inventory\`, \`allocations\`, \`movements\`
- Endpoints: \`/addresses\`, \`/locations\`, \`/inventory\`, \`/allocations\`, \`/movements\`
- Controle de estoque, reservas e movimentações.

---

## 🧪 Testes

Execute todos os testes:
\`\`\`bash
npm run test
\`\`\`

Para testar um serviço específico:
\`\`\`bash
nx test auth-service
nx test identity-service
# etc.
\`\`\`

---

## 📦 Geração de Cliente Prisma

Após alterações no schema, gere o cliente Prisma para todos os serviços:
\`\`\`bash
npm run prisma:generate
\`\`\`

Para um serviço específico:
\`\`\`bash
nx run auth-service:prisma-generate
\`\`\`

---

## 🛠️ Adicionando um Novo Serviço

1. Gere um novo aplicativo NestJS com Nx:
   \`\`\`bash
   nx g @nx/nest:app apps/backend/novo-servico
   \`\`\`
2. Configure Prisma, crie o schema e ajuste os arquivos conforme o padrão.
3. Adicione os targets necessários no \`project.json\` (prisma-generate, prisma-migrate-dev, etc.).
4. Atualize o docker-compose e o API Gateway para incluir o novo serviço.

---

## 📄 Documentação da API

Cada serviço expõe sua própria documentação Swagger em:
- Auth Service: \`http://localhost:3002/api\`
- Identity Service: \`http://localhost:3001/api\`
- Warehouse Service: \`http://localhost:3003/api\`
- Service Order Service: \`http://localhost:3004/api\`
- Logistics Service: \`http://localhost:3005/api\`

O gateway apenas roteia, não gera documentação própria.

---

## 🔐 Variáveis de Ambiente

Cada serviço possui seu próprio arquivo \`.env\`. As principais variáveis são:

- \`DATABASE_URL\` – string de conexão com o PostgreSQL
- \`PORT\` – porta em que o serviço escuta
- \`NODE_ENV\` – ambiente (development, production)

No API Gateway:
- \`AUTH_SERVICE_URL\`, \`IDENTITY_SERVICE_URL\`, etc. – URLs dos microsserviços

---

## 📈 Logs e Observabilidade

Os logs de cada serviço são exibidos no console quando executados localmente. No Docker, use \`npm run docker:logs\`. Para produção, recomenda-se usar um agregador de logs como ELK ou Datadog.

---

## 🧹 Boas Práticas de Desenvolvimento

- Siga a arquitetura modular: DTOs, repositórios, serviços, controllers.
- Utilize os pipes de validação globais (\`ValidationPipe\` com \`transform: true\`).
- Mantenha os schemas Prisma versionados e as migrações em \`prisma/migrations\`.
- Escreva testes unitários para serviços e repositórios.
- Use os scripts de formatação e linting antes de commitar.

---

## 🤝 Contribuição

1. Crie uma branch a partir de \`main\`.
2. Faça suas alterações, seguindo os padrões estabelecidos.
3. Execute testes e formatação.
4. Abra um Pull Request descrevendo as mudanças.

---

## 📞 Suporte

Em caso de dúvidas, consulte a documentação interna ou entre em contato com o time de arquitetura.

---

**© 2025 VIM - Todos os direitos reservados.**
`