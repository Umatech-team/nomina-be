# Transações Recorrentes - Guia de Integração

## Criar Transação Recorrente

### Endpoint

```
POST /transaction/recurring
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Campos Obrigatórios

| Campo         | Tipo     | Descrição                 | Validação                                         |
| ------------- | -------- | ------------------------- | ------------------------------------------------- |
| `accountId`   | `string` | ID da conta de origem     | UUID válido                                       |
| `description` | `string` | Descrição da transação    | Mínimo 1 caractere                                |
| `amount`      | `number` | **Valor em centavos**     | Número positivo                                   |
| `frequency`   | `string` | Frequência da recorrência | `WEEKLY`, `MONTHLY` ou `YEARLY`                   |
| `startDate`   | `string` | Data de início            | Formato ISO 8601 (ex: `2026-02-17T00:00:00.000Z`) |

### Campos Opcionais

| Campo        | Tipo               | Descrição                    | Validação                  | Valor Padrão     |
| ------------ | ------------------ | ---------------------------- | -------------------------- | ---------------- |
| `categoryId` | `string` ou `null` | ID da categoria              | UUID válido ou `null`      | `null`           |
| `endDate`    | `string` ou `null` | Data de término              | Formato ISO 8601 ou `null` | `null` (sem fim) |
| `interval`   | `number`           | Intervalo entre recorrências | Inteiro positivo           | `1`              |
| `active`     | `boolean`          | Status ativo/inativo         | `true` ou `false`          | `true`           |

### Importante: Valores Monetários

- **SEMPRE** envie valores em **centavos**
- Exemplo: R$ 100,50 → `10050`
- Exemplo: R$ 1.234,00 → `123400`

### Exemplo de Requisição

```json
{
  "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
  "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "description": "Mensalidade da academia",
  "amount": 15000,
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": null,
  "active": true
}
```

### Exemplo de Resposta (201 Created)

```json
{
  "id": "rec_123abc...",
  "workspaceId": "ws_456def...",
  "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
  "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "description": "Mensalidade da academia",
  "amount": 15000,
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": null,
  "lastGenerated": null,
  "active": true
}
```

### Valores de `frequency`

| Valor     | Descrição |
| --------- | --------- |
| `WEEKLY`  | Semanal   |
| `MONTHLY` | Mensal    |
| `YEARLY`  | Anual     |

### Comportamento do `interval`

- Se `frequency = MONTHLY` e `interval = 1`: a cada 1 mês
- Se `frequency = MONTHLY` e `interval = 3`: a cada 3 meses (trimestral)
- Se `frequency = WEEKLY` e `interval = 2`: a cada 2 semanas (quinzenal)

### Possíveis Erros

| Status | Erro         | Descrição                                            |
| ------ | ------------ | ---------------------------------------------------- |
| `400`  | Bad Request  | Validação falhou (campos inválidos)                  |
| `401`  | Unauthorized | Token JWT inválido ou ausente                        |
| `404`  | Not Found    | Conta ou categoria não encontrada                    |
| `403`  | Forbidden    | Conta/categoria não pertence ao workspace do usuário |

### Exemplos de Uso Comuns

#### 1. Salário Mensal

```json
{
  "accountId": "...",
  "categoryId": "...",
  "description": "Salário",
  "amount": 500000,
  "frequency": "MONTHLY",
  "startDate": "2026-03-05T00:00:00.000Z"
}
```

#### 2. Academia Trimestral (3 meses)

```json
{
  "accountId": "...",
  "categoryId": "...",
  "description": "Academia",
  "amount": 20000,
  "frequency": "MONTHLY",
  "interval": 3,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-12-01T00:00:00.000Z"
}
```

#### 3. Aluguel Semanal

```json
{
  "accountId": "...",
  "description": "Aluguel compartilhado",
  "amount": 50000,
  "frequency": "WEEKLY",
  "startDate": "2026-03-03T00:00:00.000Z"
}
```

---

## Listar Transações Recorrentes

### Endpoint

```
GET /transaction?page={page}&pageSize={pageSize}&activeOnly={activeOnly}
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Query Parameters Obrigatórios

| Parâmetro  | Tipo     | Descrição        | Validação                    |
| ---------- | -------- | ---------------- | ---------------------------- |
| `page`     | `number` | Número da página | Inteiro positivo             |
| `pageSize` | `number` | Itens por página | Inteiro positivo, máximo 100 |

### Query Parameters Opcionais

| Parâmetro    | Tipo      | Descrição             | Validação         |
| ------------ | --------- | --------------------- | ----------------- |
| `activeOnly` | `boolean` | Filtrar apenas ativos | `true` ou `false` |

### Exemplo de Requisição

```
GET /transaction?page=1&pageSize=10&activeOnly=true
```

### Exemplo de Resposta (200 OK)

```json
{
  "recurringTransactions": [
    {
      "id": "rec_123abc...",
      "workspaceId": "ws_456def...",
      "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
      "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "description": "Mensalidade da academia",
      "amount": 15000,
      "frequency": "MONTHLY",
      "interval": 1,
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": null,
      "lastGenerated": "2026-03-01T00:00:00.000Z",
      "active": true
    }
  ]
}
```

---

## Buscar Transação Recorrente por ID

### Endpoint

```
GET /transaction/:id
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Path Parameters

| Parâmetro | Tipo     | Descrição                  |
| --------- | -------- | -------------------------- |
| `id`      | `string` | ID da transação recorrente |

### Exemplo de Requisição

```
GET /transaction/rec_123abc...
```

### Exemplo de Resposta (200 OK)

```json
{
  "recurringTransaction": {
    "id": "rec_123abc...",
    "workspaceId": "ws_456def...",
    "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
    "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "description": "Mensalidade da academia",
    "amount": 15000,
    "frequency": "MONTHLY",
    "interval": 1,
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": null,
    "lastGenerated": "2026-03-01T00:00:00.000Z",
    "active": true
  }
}
```

### Possíveis Erros

| Status | Erro      | Descrição                                                 |
| ------ | --------- | --------------------------------------------------------- |
| `404`  | Not Found | Transação recorrente não encontrada                       |
| `403`  | Forbidden | Transação recorrente não pertence ao workspace do usuário |

---

## Atualizar Transação Recorrente

### Endpoint

```
PATCH /transaction/recurring/:id
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Path Parameters

| Parâmetro | Tipo     | Descrição                  |
| --------- | -------- | -------------------------- |
| `id`      | `string` | ID da transação recorrente |

### Campos (Todos Opcionais)

| Campo         | Tipo               | Descrição                    | Validação                     |
| ------------- | ------------------ | ---------------------------- | ----------------------------- |
| `categoryId`  | `string` ou `null` | ID da categoria              | UUID válido ou `null`         |
| `description` | `string`           | Descrição da transação       | Mínimo 1 caractere            |
| `amount`      | `number`           | **Valor em centavos**        | Número positivo               |
| `frequency`   | `string`           | Frequência da recorrência    | `WEEKLY`, `MONTHLY`, `YEARLY` |
| `interval`    | `number`           | Intervalo entre recorrências | Inteiro positivo              |
| `startDate`   | `string`           | Data de início               | Formato ISO 8601              |
| `endDate`     | `string` ou `null` | Data de término              | Formato ISO 8601 ou `null`    |

### Exemplo de Requisição

```json
{
  "description": "Mensalidade da academia - Premium",
  "amount": 18000
}
```

### Exemplo de Resposta (200 OK)

```json
{
  "recurringTransaction": {
    "id": "rec_123abc...",
    "workspaceId": "ws_456def...",
    "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
    "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "description": "Mensalidade da academia - Premium",
    "amount": 18000,
    "frequency": "MONTHLY",
    "interval": 1,
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": null,
    "lastGenerated": "2026-03-01T00:00:00.000Z",
    "active": true
  }
}
```

### Possíveis Erros

| Status | Erro        | Descrição                                                 |
| ------ | ----------- | --------------------------------------------------------- |
| `400`  | Bad Request | Validação falhou (campos inválidos)                       |
| `404`  | Not Found   | Transação recorrente não encontrada                       |
| `403`  | Forbidden   | Transação recorrente não pertence ao workspace do usuário |

---

## Deletar Transação Recorrente

### Endpoint

```
DELETE /transaction/recurring/:id
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Path Parameters

| Parâmetro | Tipo     | Descrição                  |
| --------- | -------- | -------------------------- |
| `id`      | `string` | ID da transação recorrente |

### Exemplo de Requisição

```
DELETE /transaction/recurring/rec_123abc...
```

### Exemplo de Resposta (200 OK)

```json
{}
```

### Possíveis Erros

| Status | Erro      | Descrição                                                 |
| ------ | --------- | --------------------------------------------------------- |
| `404`  | Not Found | Transação recorrente não encontrada                       |
| `403`  | Forbidden | Transação recorrente não pertence ao workspace do usuário |

---

## Ativar/Desativar Transação Recorrente

### Endpoint

```
PATCH /transaction/recurring/active/:id
```

### Autenticação

Requer token JWT no header `Authorization: Bearer {token}`

### Path Parameters

| Parâmetro | Tipo     | Descrição                  |
| --------- | -------- | -------------------------- |
| `id`      | `string` | ID da transação recorrente |

### Descrição

Alterna o status `active` da transação recorrente entre `true` e `false`. Não requer body na requisição.

### Exemplo de Requisição

```
PATCH /transaction/recurring/active/rec_123abc...
```

### Exemplo de Resposta (200 OK)

```json
{
  "recurringTransaction": {
    "id": "rec_123abc...",
    "workspaceId": "ws_456def...",
    "accountId": "f7b3c2a1-4d5e-6f7g-8h9i-0j1k2l3m4n5o",
    "categoryId": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "description": "Mensalidade da academia",
    "amount": 15000,
    "frequency": "MONTHLY",
    "interval": 1,
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": null,
    "lastGenerated": "2026-03-01T00:00:00.000Z",
    "active": false
  }
}
```

### Possíveis Erros

| Status | Erro      | Descrição                                                 |
| ------ | --------- | --------------------------------------------------------- |
| `404`  | Not Found | Transação recorrente não encontrada                       |
| `403`  | Forbidden | Transação recorrente não pertence ao workspace do usuário |
