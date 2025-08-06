# 🚀 Frontend Quick Start - Nomina API

## 📋 TL;DR - Para Desenvolvedores Frontend

### 🔗 URLs Importantes

- **API Base**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/docs`
- **Documentação Completa**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 🔐 Autenticação Rápida

```javascript
// 1. Login
const { access_token } = await fetch("/member/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@test.com", password: "senha123" }),
}).then((r) => r.json());

// 2. Use o token
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${access_token}`,
};
```

### 💸 Valores Monetários

```javascript
// ✅ CORRETO - Sempre decimal
{
  "amount": 150.75  // R$ 150,75
}

// ❌ ERRADO - Não enviar em centavos
{
  "amount": 15075
}
```

### 📅 Datas

```javascript
// ✅ CORRETO - String YYYY-MM-DD
{
  "date": "2025-01-15"
}

// ❌ ERRADO - Outros formatos
{
  "date": "15/01/2025"  // Não aceito
}
```

## 🛠️ Endpoints Essenciais

### Autenticação

```javascript
// Login
POST /member/login
{
  "email": "user@test.com",
  "password": "senha123"
}

// Criar conta
POST /member/create
{
  "name": "João Silva",
  "email": "joao@test.com",
  "password": "senha123",
  "planType": "FREE"
}
```

### Transações

```javascript
// Criar transação
POST /transaction/create
{
  "title": "Compra Supermercado",
  "amount": 150.75,
  "type": "EXPENSE",        // "INCOME" ou "EXPENSE"
  "category": "FOOD",
  "method": "CARD",         // "CASH", "CARD", "PIX"
  "date": "2025-01-15"
}

// Buscar transações
GET /transaction/find?page=1&limit=10&type=EXPENSE

// Resumo financeiro
GET /transaction/summary
```

### Metas

```javascript
// Criar meta
POST /goal/create
{
  "title": "Viagem Europa",
  "targetAmount": 8000.00,
  "currentAmount": 1500.00,
  "monthlyContribution": 500.00,
  "category": "TRAVEL"
}

// Listar metas
GET /goal/find
```

## ⚠️ Pontos de Atenção

### 🔴 Erros Comuns

1. **401 Unauthorized**: Token ausente/inválido
2. **400 Bad Request**: Campo obrigatório ausente
3. **409 Conflict**: Email já existe

### 🎯 Dicas de Integração

- Use Swagger UI (`/docs`) para testar endpoints
- Valores monetários sempre em decimal (nunca centavos)
- Datas sempre no formato ISO (`YYYY-MM-DD`)
- Headers de autenticação obrigatórios (exceto login/registro)

### 📊 Estrutura de Response

```javascript
// Sucesso
{
  "data": { ... },
  "message": "Success"
}

// Erro
{
  "message": "Email already exists",
  "statusCode": 409,
  "details": { ... }
}
```

## 🧪 Teste Rápido

```bash
# Testar se API está funcionando
curl http://localhost:8080/docs

# Criar usuário de teste
curl -X POST http://localhost:8080/member/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456","planType":"FREE"}'
```

## 📚 Recursos Adicionais

- **Documentação Completa**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Swagger UI**: http://localhost:8080/docs
- **Tipos TypeScript**: Disponíveis nos DTOs da pasta `src/modules/*/dto/`

---

**⚡ Pro Tip**: Use o Swagger UI para testar todos os endpoints antes de integrar no frontend!
