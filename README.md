# Nomina

> **O peso real do seu patrimônio.**

## 🏛️ Conceito

**Nomina** — Em economia, "nomina" é a garantia de valor de uma moeda (ex: nomina em ouro). Significa ter substância, ter base real. Não é apenas ter números na tela, mas ter patrimônio real.

Este é um backend de gestão patrimonial pessoal construído para aqueles que não estão brincando com planilhas, mas construindo garantias reais para o futuro.

### Identidade

- **Vibe**: Institucional, Séria, "Old Money" com Tech
- **Proposta**: Gerenciamento patrimonial com substância e credibilidade
- **Diferencial**: Foco em patrimônio real, não apenas finanças pessoais

## 🚀 Stack Tecnológica

- **Framework**: NestJS
- **Database**: PostgreSQL + Drizzle ORM
- **Cache**: Redis (opcional)
- **Autenticação**: JWT (RS256)
- **Arquitetura**: Domain-Driven Design (DDD) + Clean Architecture

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- PostgreSQL 15+
- Redis (opcional)
- Docker & Docker Compose (recomendado)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd nomina-be
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nomina"
JWT_PRIVATE_KEY_BASE64="<sua-chave-privada-base64>"
JWT_PUBLIC_KEY_BASE64="<sua-chave-publica-base64>"
NODE_ENV="development"
PORT=8080
```

### 4. Inicie a infraestrutura com Docker

```bash
docker-compose up -d
```

Isso iniciará:

- PostgreSQL na porta `5432` (container: `nomina_postgres`)
- Redis na porta `6379` (container: `nomina_redis`)

### 5. Execute as migrations

```bash
npx drizzle-kit migrate
```

### 6. Inicie o servidor

```bash
npm run dev
# ou
bun run dev
```

O servidor estará rodando em `http://localhost:8080`

## 📚 Documentação

### Swagger (Desenvolvimento)

Quando `NODE_ENV=dev`, a documentação interativa está disponível em:

```
http://localhost:8080/api
```

### Documentação da API

- [Rotas da API](./docs/API_ROUTES.md) - Documentação completa de todos os endpoints
- [Testes de API](./API_TESTS.md) - Exemplos de comandos `curl` para testar
- [Sistema de Roles](./ROLE_GUARDS.md) - Controle de acesso baseado em roles

## 🏗️ Arquitetura

### Padrão DDD + Clean Architecture

Cada módulo segue uma estrutura em camadas:

```
src/modules/<module-name>/
├── controllers/     # Endpoints HTTP (camada de apresentação)
├── services/        # Lógica de negócio
├── repositories/    # Contratos de acesso a dados
│   └── contracts/   # Interfaces abstratas
├── entities/        # Modelos de domínio
├── gateways/        # Validação de entrada (Zod)
├── presenters/      # Formatação de saída
├── dto/            # Data Transfer Objects
└── errors/         # Erros de domínio
```

### Módulos Principais

- **User**: Autenticação e gerenciamento de usuários
- **Workspace**: Workspaces multi-tenant
- **Account**: Contas financeiras (corrente, investimentos, cartões)
- **Category**: Categorias de receitas/despesas
- **Transaction**: Transações financeiras
- **Subscription**: Planos e limites de assinatura
- **Report**: Análises e relatórios patrimoniais

### Princípios Críticos

#### 1. Pattern Either para Erros

Todos os services retornam `Either<Error, Success>`:

```typescript
const result = await service.execute(request);
if (result.isLeft()) {
  return ErrorPresenter.toHTTP(result.value); // Erro
}
const { data } = result.value; // Sucesso
```

#### 2. Valores Monetários em Centavos

**CRÍTICO**: Todos os valores são armazenados como `BigInt` em centavos:

```typescript
// R$ 100,50 → 10050 centavos
MoneyUtils.decimalToCents(100.5); // → 10050
```

#### 3. Multi-tenancy por Workspace

Todos os recursos pertencem a um `workspaceId`. Sempre:

1. Extrair `workspaceId` do token JWT
2. Validar ownership verificando `workspaceId`
3. Filtrar queries por `workspaceId`

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 🔐 Autenticação

Sistema baseado em JWT com dois tokens:

- **Access Token**: 15 minutos (RS256)
- **Refresh Token**: 7 dias (RS256)

### Roles de Acesso

- `OWNER`: Proprietário do workspace (acesso total)
- `ADMIN`: Administrador (criar/editar recursos)
- `USER`: Usuário comum (transações e visualização)
- `VIEWER`: Apenas leitura

## 🗄️ Database

### Comandos Drizzle Kit

```bash
# Gerar migration
npx drizzle-kit generate --name <migration-name>

# Aplicar migrations
npx drizzle-kit migrate

# Abrir Drizzle Studio (GUI)
npx drizzle-kit studio
```

### Gerenciar Containers Docker

```bash
# Iniciar infraestrutura
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Resetar database (CUIDADO!)
docker-compose down -v
docker-compose up -d
npx drizzle-kit migrate
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (watch mode)
npm run build        # Build para produção
npm run start:prod   # Rodar produção
npm run lint         # ESLint
npm test             # Testes unitários
npm run test:e2e     # Testes E2E
npm run test:cov     # Coverage
```

## 🚢 Deploy

### Build de Produção

```bash
npm run build
npm run start:prod
```

### Variáveis de Ambiente (Produção)

```env
DATABASE_URL="postgresql://user:pass@host:5432/nomina"
JWT_PRIVATE_KEY_BASE64="..."
JWT_PUBLIC_KEY_BASE64="..."
NODE_ENV="production"
PORT=8080
REDIS_ENABLED=true
REDIS_HOST="..."
REDIS_PORT=6379
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

UNLICENSED - Proprietary Software

---

**Nomina** — Construindo garantias reais para o futuro.
