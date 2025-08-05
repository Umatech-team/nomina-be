# 📊 Nomina API - Documentação para Frontend

Esta documentação detalha todos os endpoints da API Nomina, incluindo formatos de request/response, autenticação e exemplos práticos.

## 🔗 Base URL

```
http://localhost:8080
```

## 🔐 Autenticação

A API utiliza **JWT Bearer Token** para autenticação. Todas as rotas (exceto `/member/create`, `/member/login` e `/refresh_token`) requerem o header:

```http
Authorization: Bearer <jwt_token>
```

### Token Response Format

```json
{
  "access_token": "eyJhbGciOiJSUzI1Ni...",
  "refresh_token": "eyJhbGciOiJSUzI1Ni..."
}
```

---

## 👤 **MEMBER ENDPOINTS**

### 1. **POST** `/member/create` (Público)

Criar novo membro na plataforma.

**Request Body:**

```json
{
  "name": "Victor Marques",
  "email": "victor@exemplo.com",
  "password": "senha123",
  "planType": "FREE"
}
```

**Response (201):**

```json
{
  "message": "Membro criado com sucesso"
}
```

**Validações:**

- `name`: String obrigatória, mínimo 2 caracteres
- `email`: Email válido e único
- `password`: String obrigatória, mínimo 6 caracteres
- `planType`: "FREE" ou "PREMIUM"

---

### 2. **POST** `/member/login` (Público)

Autenticar membro existente.

**Request Body:**

```json
{
  "email": "victor@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJSUzI1Ni...",
  "refresh_token": "eyJhbGciOiJSUzI1Ni..."
}
```

---

### 3. **GET** `/member` (Autenticado)

Obter dados do membro logado.

**Response (200):**

```json
{
  "id": 1,
  "name": "Victor Marques",
  "email": "victor@exemplo.com",
  "planType": "FREE",
  "balance": 1250.75,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4. **PATCH** `/member/update/general-infos` (Autenticado)

Atualizar informações gerais do membro.

**Request Body:**

```json
{
  "name": "Victor Silva Marques"
}
```

**Response (200):**

```json
{
  "message": "Informações atualizadas com sucesso"
}
```

---

### 5. **PATCH** `/member/update/password` (Autenticado)

Atualizar senha do membro.

**Request Body:**

```json
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}
```

**Response (200):**

```json
{
  "message": "Senha atualizada com sucesso"
}
```

---

### 6. **GET** `/refresh_token` (Público)

Renovar token de acesso.

**Headers:**

```http
Authorization: Bearer <refresh_token>
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJSUzI1Ni..."
}
```

---

## 💸 **TRANSACTION ENDPOINTS**

### 7. **POST** `/transaction/create` (Autenticado)

Criar nova transação.

**Request Body:**

```json
{
  "title": "Compra Supermercado",
  "description": "Compras mensais no Extra",
  "amount": 150.75,
  "type": "EXPENSE",
  "category": "FOOD",
  "subCategory": "Groceries",
  "method": "CARD",
  "currency": "BRL",
  "date": "2025-01-15"
}
```

**Response (201):**

```json
{
  "transaction": {
    "id": 1,
    "type": "EXPENSE",
    "title": "Compra Supermercado",
    "category": "FOOD",
    "amount": 150.75,
    "method": "CARD",
    "date": "2025-01-15T00:00:00.000Z"
  },
  "monthlySummary": {
    "month": 1,
    "year": 2025,
    "totalIncome": 0,
    "totalExpenses": 150.75,
    "balance": -150.75,
    "transactionCount": 1
  }
}
```

**Enums:**

- `type`: "INCOME" | "EXPENSE"
- `method`: "CASH" | "CARD" | "PIX"

**Validações:**

- `amount`: Número decimal positivo (ex: 150.75)
- `date`: String no formato "YYYY-MM-DD"
- Todos os campos são obrigatórios exceto `description`

---

### 8. **GET** `/transaction/find` (Autenticado)

Buscar transações com filtros.

**Query Parameters:**

- `page`: número (default: 1)
- `limit`: número (default: 20)
- `type`: "INCOME" | "EXPENSE" (opcional)
- `category`: string (opcional)
- `startDate`: "YYYY-MM-DD" (opcional)
- `endDate`: "YYYY-MM-DD" (opcional)

**Exemplo:**

```
GET /transaction/find?page=1&limit=10&type=EXPENSE&category=FOOD
```

**Response (200):**

```json
{
  "transactions": [
    {
      "id": 1,
      "title": "Compra Supermercado",
      "description": "Compras mensais",
      "amount": 150.75,
      "type": "EXPENSE",
      "category": "FOOD",
      "subCategory": "Groceries",
      "method": "CARD",
      "currency": "BRL",
      "date": "2025-01-15T00:00:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 9. **GET** `/transaction/list` (Autenticado)

Listar todas as transações do usuário.

**Response (200):**

```json
{
  "transactions": [
    {
      "id": 1,
      "title": "Salário",
      "amount": 3000.0,
      "type": "INCOME",
      "category": "SALARY",
      "method": "PIX",
      "date": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 10. **PATCH** `/transaction/update` (Autenticado)

Atualizar transação existente.

**Request Body:**

```json
{
  "id": 1,
  "title": "Compra Supermercado Atualizada",
  "amount": 175.5,
  "category": "FOOD"
}
```

**Response (200):**

```json
{
  "message": "Transação atualizada com sucesso",
  "transaction": {
    "id": 1,
    "title": "Compra Supermercado Atualizada",
    "amount": 175.5,
    "category": "FOOD",
    "type": "EXPENSE",
    "method": "CARD",
    "date": "2025-01-15T00:00:00.000Z"
  }
}
```

---

### 11. **DELETE** `/transaction/delete` (Autenticado)

Excluir transação.

**Request Body:**

```json
{
  "id": 1
}
```

**Response (200):**

```json
{
  "message": "Transação excluída com sucesso"
}
```

---

### 12. **GET** `/transaction/summary` (Autenticado)

Obter resumo financeiro do usuário.

**Response (200):**

```json
{
  "totalIncome": 5000.0,
  "totalExpenses": 3250.75,
  "balance": 1749.25,
  "transactionCount": 45,
  "averageIncome": 1250.0,
  "averageExpense": 72.24
}
```

---

### 13. **GET** `/transaction/monthly-summary-with-percentage` (Autenticado)

Obter resumo mensal com percentuais.

**Query Parameters:**

- `month`: número (1-12)
- `year`: número (ex: 2025)

**Exemplo:**

```
GET /transaction/monthly-summary-with-percentage?month=1&year=2025
```

**Response (200):**

```json
{
  "current": {
    "month": 1,
    "year": 2025,
    "totalIncome": 3000.0,
    "totalExpenses": 1250.75,
    "balance": 1749.25,
    "transactionCount": 12
  },
  "previous": {
    "month": 12,
    "year": 2024,
    "totalIncome": 2800.0,
    "totalExpenses": 1100.5,
    "balance": 1699.5,
    "transactionCount": 10
  },
  "percentageChange": {
    "income": 7.14,
    "expenses": 13.66,
    "balance": 2.93
  }
}
```

---

### 14. **GET** `/transaction/list/top-expenses-by-category` (Autenticado)

Obter maiores gastos por categoria.

**Query Parameters:**

- `limit`: número (default: 5)
- `month`: número (opcional)
- `year`: número (opcional)

**Response (200):**

```json
{
  "categories": [
    {
      "category": "FOOD",
      "totalAmount": 850.75,
      "transactionCount": 15,
      "percentage": 42.5
    },
    {
      "category": "TRANSPORT",
      "totalAmount": 320.0,
      "transactionCount": 8,
      "percentage": 16.0
    }
  ],
  "totalExpenses": 2000.0
}
```

---

## 🎯 **GOAL ENDPOINTS**

### 15. **POST** `/goal/create` (Autenticado)

Criar nova meta financeira.

**Request Body:**

```json
{
  "title": "Viagem para Europa",
  "category": "TRAVEL",
  "targetAmount": 8000.0,
  "currentAmount": 1500.0,
  "monthlyContribution": 500.0,
  "currency": "BRL"
}
```

**Response (201):**

```json
{
  "id": 1,
  "title": "Viagem para Europa",
  "category": "TRAVEL",
  "targetAmount": 8000.0,
  "currentAmount": 1500.0,
  "monthlyContribution": 500.0,
  "currency": "BRL",
  "progress": 18.75,
  "remainingAmount": 6500.0,
  "estimatedMonths": 13,
  "isCompleted": false,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 16. **GET** `/goal/find` (Autenticado)

Buscar metas do usuário.

**Query Parameters:**

- `category`: string (opcional)
- `completed`: boolean (opcional)

**Response (200):**

```json
{
  "goals": [
    {
      "id": 1,
      "title": "Viagem para Europa",
      "category": "TRAVEL",
      "targetAmount": 8000.0,
      "currentAmount": 1500.0,
      "monthlyContribution": 500.0,
      "progress": 18.75,
      "remainingAmount": 6500.0,
      "estimatedMonths": 13,
      "isCompleted": false
    }
  ]
}
```

---

### 17. **PATCH** `/goal/update` (Autenticado)

Atualizar meta existente.

**Request Body:**

```json
{
  "id": 1,
  "currentAmount": 2000.0,
  "monthlyContribution": 600.0
}
```

**Response (200):**

```json
{
  "message": "Meta atualizada com sucesso",
  "goal": {
    "id": 1,
    "title": "Viagem para Europa",
    "targetAmount": 8000.0,
    "currentAmount": 2000.0,
    "monthlyContribution": 600.0,
    "progress": 25.0,
    "remainingAmount": 6000.0,
    "estimatedMonths": 10,
    "isCompleted": false
  }
}
```

---

## 📋 **FORMATOS DE DADOS**

### Valores Monetários

- **Request**: Sempre enviar valores em **decimal** (ex: `150.75`)
- **Response**: API retorna valores em **decimal** (ex: `150.75`)
- **Moeda**: Padrão "BRL", aceita códigos ISO 4217

### Datas

- **Request**: String no formato `"YYYY-MM-DD"` (ex: `"2025-01-15"`)
- **Response**: String ISO 8601 (ex: `"2025-01-15T10:30:00.000Z"`)

### Paginação

```json
{
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8
}
```

---

## ⚠️ **CÓDIGOS DE ERRO**

### Códigos HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `404`: Não encontrado
- `409`: Conflito (ex: email já existe)
- `500`: Erro interno do servidor

### Formato de Erro

```json
{
  "message": "Descrição do erro",
  "statusCode": 400,
  "details": {
    "field": "email",
    "value": "invalid-email",
    "constraint": "deve ser um email válido"
  }
}
```

### Erros Comuns

- **401 Unauthorized**: Token ausente ou inválido
- **400 Bad Request**: Campos obrigatórios ausentes ou inválidos
- **409 Conflict**: Email já cadastrado
- **404 Not Found**: Recurso não encontrado

---

## 🧪 **EXEMPLOS DE USO**

### Fluxo de Autenticação

```javascript
// 1. Criar conta
const createResponse = await fetch("/member/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Victor",
    email: "victor@test.com",
    password: "senha123",
    planType: "FREE",
  }),
});

// 2. Fazer login
const loginResponse = await fetch("/member/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "victor@test.com",
    password: "senha123",
  }),
});

const { access_token } = await loginResponse.json();

// 3. Usar token nas próximas requisições
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${access_token}`,
};
```

### Criar Transação

```javascript
const transaction = await fetch("/transaction/create", {
  method: "POST",
  headers,
  body: JSON.stringify({
    title: "Salário Janeiro",
    description: "Salário mensal",
    amount: 3000.0,
    type: "INCOME",
    category: "SALARY",
    subCategory: "Work",
    method: "PIX",
    currency: "BRL",
    date: "2025-01-01",
  }),
});
```

### Buscar Transações

```javascript
const transactions = await fetch(
  "/transaction/find?page=1&limit=10&type=EXPENSE&category=FOOD",
  { headers },
);
```

---

## 🔧 **CONFIGURAÇÃO DO PROJETO**

### Variáveis de Ambiente Necessárias

```env
PORT=8080
DATABASE_URL="postgresql://..."
NODE_ENV="dev"
JWT_PRIVATE_KEY="..."
JWT_PUBLIC_KEY="..."
```

### Banco de Dados

- **PostgreSQL** com Prisma ORM
- Valores monetários armazenados em **centavos** internamente
- Conversão automática para decimais na API

---

## 📚 **SWAGGER UI**

Para explorar a API interativamente, acesse:

```
http://localhost:8080/docs
```

A documentação Swagger oferece:

- Interface para testar endpoints
- Schemas detalhados
- Exemplos de request/response
- Autenticação integrada

---

## 🎯 **RESUMO PARA DESENVOLVEDORES FRONTEND**

### Principais Pontos de Atenção:

1. **Autenticação**: Sempre incluir Bearer token (exceto endpoints públicos)
2. **Valores Monetários**: Enviar e receber sempre em formato decimal
3. **Datas**: Usar formato ISO para requests (`YYYY-MM-DD`)
4. **Validação**: API retorna erros detalhados para campos inválidos
5. **Paginação**: Disponível em endpoints de listagem
6. **Refresh Token**: Renovar tokens automaticamente quando expiram

### Endpoints Mais Utilizados:

- `POST /member/login` - Autenticação
- `POST /transaction/create` - Criar transação
- `GET /transaction/find` - Buscar transações
- `GET /transaction/summary` - Resumo financeiro
- `GET /goal/find` - Listar metas

### Headers Padrão:

```javascript
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${access_token}`,
};
```
