# Melhorias do Sistema de Pagamentos - Centavos

## Resumo das Implementações

Este documento descreve as melhorias implementadas no sistema de pagamentos do Nomina Backend para trabalhar com valores monetários em centavos, eliminando problemas de precisão de ponto flutuante.

## Principais Melhorias

### 1. **Value Object Money**
- Novo value object para representar valores monetários de forma segura
- Armazena valores em centavos (inteiros) evitando problemas de precisão
- Suporte a operações aritméticas (soma, subtração, multiplicação)
- Comparações seguras entre valores
- Formatação automática para exibição
- Conversão entre decimal e centavos

### 2. **Migração do Banco de Dados**
- Conversão de campos `Float` para `BigInt` nas tabelas:
  - `transactions.amount`
  - `goals.target_amount`, `current_amount`, `monthly_contribution`
  - `member_monthly_summary.total_income`, `total_expense`, `total_investments`, `balance`
  - `payment_history.amount`
- Migração automatizada preservando dados existentes

### 3. **Entidades Atualizadas**

#### Transaction
- Novos métodos para trabalhar com Money:
  - `get money()`: Retorna valor como objeto Money
  - `get amountDecimal()`: Valor em formato decimal para exibição
  - `setAmountFromDecimal()`: Define valor a partir de decimal
- Validações rigorosas para centavos (inteiros não negativos)

#### Goal
- Métodos para todos os campos monetários:
  - `targetMoney`, `currentMoney`, `monthlyContributionMoney`
  - Conversões entre decimal e centavos
  - Cálculos de progresso e estimativas
- Novo método `addContribution()` para adicionar contribuições
- Propriedades calculadas: `progressPercentage`, `remainingAmount`, `isCompleted`

### 4. **Utilitários MoneyUtils**
- Conversões seguras entre decimal e centavos
- Validações de tipos (`isValidCents`, `isValidDecimal`)
- Operações com arrays de Money (soma, máximo, mínimo, média)
- Formatação de valores para exibição
- Enriquecimento de objetos com campos formatados

### 5. **API Atualizada**
- **Gateways**: Continuam aceitando valores decimais (compatibilidade)
- **Services**: Convertem automaticamente para centavos
- **Presenters**: Retornam valores em múltiplos formatos:
  - `amount`: Decimal para compatibilidade
  - `amountCents`: Valor bruto em centavos
  - `amountFormatted`: Valor formatado para exibição

### 6. **Configuração**
- Novo path alias `@utils/*` no TypeScript
- Dependências atualizadas nos services

## Compatibilidade

### ✅ Mantida
- API continua aceitando valores decimais
- Responses mantêm formato decimal no campo `amount`
- Nenhuma breaking change para clientes da API

### 🔄 Melhorada
- Precisão matemática eliminando problemas de ponto flutuante
- Performance melhorada com operações em inteiros
- Novos campos formatados nas respostas (`amountFormatted`, `amountCents`)

## Testes

### Cobertura de Testes Implementada
- **Money Value Object**: 25 testes cobrindo todas as funcionalidades
- **MoneyUtils**: 21 testes para utilitários e validações
- **Transaction Entity**: 23 testes para lógica de centavos
- **Goal Entity**: 34 testes incluindo cálculos e contribuições

### Cenários Testados
- Conversões entre decimal e centavos
- Operações aritméticas com Money
- Validações de tipos e valores
- Casos extremos (zero, valores grandes, precisão)
- Formatação e apresentação
- Lógica de negócio (metas, progresso, estimativas)

## Exemplo de Uso

### Antes (Float)
```json
{
  "amount": 25.50,
  "targetAmount": 1000.00
}
```

### Depois (Centavos internamente)
```json
{
  "amount": 25.50,
  "amountCents": 2550,
  "amountFormatted": "R$ 25,50",
  "targetAmount": 1000.00,
  "targetAmountCents": 100000,
  "targetAmountFormatted": "R$ 1.000,00"
}
```

## Comandos para Testes

```bash
# Todos os testes
bun test

# Testes específicos
bun test src/shared/valueObjects/Money.spec.ts
bun test src/utils/MoneyUtils.spec.ts
bun test src/modules/transaction/entities/Transaction.spec.ts
bun test src/modules/goal/entities/Goal.spec.ts
```

## Migração

A migração `20250805152016_convert_money_fields_to_cents` já foi aplicada e converte automaticamente:
- Valores existentes de Float para BigInt (multiplicando por 100)
- Preserva todos os dados existentes
- Não requer intervenção manual

## Benefícios

1. **Precisão**: Elimina problemas de ponto flutuante (ex: 0.1 + 0.2 = 0.3)
2. **Performance**: Operações com inteiros são mais rápidas
3. **Segurança**: Value objects previnem erros de tipo
4. **Manutenibilidade**: Código mais limpo e expressivo
5. **Testabilidade**: Cobertura de testes abrangente
6. **Compatibilidade**: API externa não sofre breaking changes
