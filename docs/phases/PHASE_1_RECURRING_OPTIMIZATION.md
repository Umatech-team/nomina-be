# Phase 1: Otimização de Transações Recorrentes

> **Dependência:** Nenhuma (paralela com Phase 2)
> **Objetivo:** Corrigir gargalos de escalabilidade para que o sistema processe milhares de recorrências por workspace sem problemas.

---

## Estado Atual (problemas identificados)

O sistema de recorrência é funcional mas tem 4 gargalos críticos:

1. **Limite fixo de 10 recorrências por execução** — o cron job chama `listNeedingGeneration(referenceDate, 10, 0)` sem loop de paginação. Se existirem 15 recorrências ativas, 5 ficam sem processar indefinidamente.

2. **Sem indexes na tabela `recurring_transactions`** — as queries de geração fazem full table scan filtrando por `active = true AND start_date <= referenceDate AND (last_generated IS NULL OR last_generated < referenceDate)`.

3. **Lock TTL de 30 segundos** — se o job demorar mais que 30s (provável com muitos registros), o lock expira e outra instância pode iniciar em paralelo.

4. **Sem cap de geração por recorrência** — se `lastGenerated` estiver muito no passado (ex: 2 anos atrás com frequência diária), o loop gera centenas de transações de uma vez, podendo travar memória e I/O.

### Arquivos relevantes do estado atual

| Arquivo                                                                            | Responsabilidade                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/modules/transaction/jobs/create-recurring-transaction.handler.ts`             | Cron job global que processa recorrências            |
| `src/modules/transaction/services/generate-recurring-transactions.service.ts`      | Service por workspace chamado no list de transações  |
| `src/modules/transaction/services/calculate-next-generation-date.service.ts`       | Calcula próxima data baseado em frequência/intervalo |
| `src/modules/transaction/repositories/contracts/RecurringTransactionRepository.ts` | Contract do repositório                              |
| `src/infra/databases/drizzle/repositories/recurring-transaction.repository.ts`     | Implementação Drizzle                                |
| `src/infra/databases/drizzle/schema.ts`                                            | Schema (tabela `recurringTransactions`)              |

---

## Tarefa 1.1 — Adicionar indexes no banco

### Contexto

A tabela `recurring_transactions` não possui nenhum index além da primary key. Todas as queries de geração fazem full table scan.

### Sub-tarefas

- [ ] **1.1.1** — Criar migration Prisma adicionando 3 indexes:

  ```sql
  CREATE INDEX idx_recurring_active_start ON recurring_transactions (active, start_date);
  CREATE INDEX idx_recurring_workspace_active ON recurring_transactions (workspace_id, active);
  CREATE INDEX idx_recurring_last_generated ON recurring_transactions (last_generated);
  ```

  Comando: `npx prisma migrate dev --name add_recurring_indexes`

- [ ] **1.1.2** — Atualizar `src/infra/databases/drizzle/schema.ts` declarando os mesmos indexes na definição da tabela `recurringTransactions`:

  ```ts
  (table) => [
    index("idx_recurring_active_start").on(table.active, table.startDate),
    index("idx_recurring_workspace_active").on(table.workspaceId, table.active),
    index("idx_recurring_last_generated").on(table.lastGenerated),
  ];
  ```

- [ ] **1.1.3** — Rodar `npx drizzle-kit migrate` para sincronizar Drizzle

### Verificação

```bash
# Verificar indexes no banco
psql -c "\d recurring_transactions" | grep idx_recurring

# Rodar testes existentes
npm run test
```

---

## Tarefa 1.2 — Corrigir processamento em batch no cron job

### Contexto

Após concluir a Tarefa 1.1 (indexes), o banco está otimizado para as queries. Agora o cron job precisa processar TODAS as recorrências pendentes, não apenas as 10 primeiras.

### Estado atual do código problemático

No arquivo `src/modules/transaction/jobs/create-recurring-transaction.handler.ts`:

```ts
// Linha ~51 — busca apenas 10, sem loop
const recurrings = await this.recurringRepository.listNeedingGeneration(
  referenceDate,
  10,
  0,
);
```

O contract do repositório **já suporta** `limit` e `offset`, então não precisa de alteração no repositório.

### Sub-tarefas

- [ ] **1.2.1** — Adicionar constante `BATCH_SIZE = 50` no handler
- [ ] **1.2.2** — Substituir a chamada única de `listNeedingGeneration` por um loop `do...while` que pagina:

  ```ts
  const BATCH_SIZE = 50;
  let offset = 0;
  let batch: RecurringTransaction[];

  do {
    batch = await this.recurringRepository.listNeedingGeneration(
      referenceDate,
      BATCH_SIZE,
      offset,
    );

    for (const recurring of batch) {
      const generated = await this.generateTransactionsForRecurring(
        recurring,
        referenceDate,
      );
      generatedCount += generated;
    }

    offset += BATCH_SIZE;
  } while (batch.length === BATCH_SIZE);
  ```

- [ ] **1.2.3** — Adicionar log no início de cada batch: `Processing batch at offset ${offset}, found ${batch.length} recurrings`

### Verificação

```bash
# Criar 15+ recorrências no banco e verificar que todas são processadas
npm run test

# Verificar logs do cron job indicando múltiplos batches
```

---

## Tarefa 1.3 — Corrigir segurança do lock distribuído

### Contexto

Após concluir a Tarefa 1.2 (paginação), o job agora processa todas as recorrências. Mas com mais trabalho por execução, o lock de 30s é insuficiente.

### Estado atual do código problemático

No arquivo `src/modules/transaction/jobs/create-recurring-transaction.handler.ts`:

```ts
// Lock TTL = 30 segundos — insuficiente para batches grandes
await this.redis.acquireLock(lockKey, 30);
```

### Sub-tarefas

- [ ] **1.3.1** — Aumentar lock TTL de `30` para `300` (5 minutos):
  ```ts
  const LOCK_TTL_SECONDS = 300;
  await this.redis.acquireLock(lockKey, LOCK_TTL_SECONDS);
  ```
- [ ] **1.3.2** — Aumentar TTL correspondente no service por workspace (`generate-recurring-transactions.service.ts`) de `30` para `120` (2 minutos) — esse é chamado no contexto de request HTTP, então não precisa de 5 min, mas 30s ainda é pouco
- [ ] **1.3.3** — Verificar que o `markAsProcessedToday` é chamado ANTES de `releaseLock` (já está correto, mas confirmar)
- [ ] **1.3.4** — Adicionar constante `CACHE_TTL_SECONDS = 86400` no lugar do número mágico `86400`

### Verificação

```bash
npm run test

# Validar manualmente: triggerar o job e verificar no Redis que o lock tem TTL ~300s
# redis-cli TTL "lock:recurring:2026-03-31"
```

---

## Tarefa 1.4 — Adicionar cap de geração por recorrência

### Contexto

Após concluir as Tarefas 1.2 e 1.3, o job processa tudo com lock seguro. Mas se uma recorrência tem `lastGenerated` de 2 anos atrás com frequência semanal, o loop gera ~104 transações de uma vez por recorrência, multiplicado por N recorrências = risco de OOM.

### Onde o problema ocorre

Em **dois** arquivos com a mesma lógica:

1. `src/modules/transaction/jobs/create-recurring-transaction.handler.ts` — método `generateTransactionsForRecurring`
2. `src/modules/transaction/services/generate-recurring-transactions.service.ts` — método `generateTransactionsForRecurring`

O loop while gera transações infinitamente até `nextDate > referenceDate`:

```ts
while (nextDate <= referenceDate) {
  // ... cria transação após transação sem limite
}
```

### Sub-tarefas

- [ ] **1.4.1** — Adicionar constante `MAX_GENERATIONS_PER_RECURRING = 365` em ambos os arquivos
- [ ] **1.4.2** — Adicionar contador no loop e `break` quando atingir o cap:

  ```ts
  const MAX_GENERATIONS_PER_RECURRING = 365;
  let generationCount = 0;

  while (nextDate <= referenceDate) {
    if (generationCount >= MAX_GENERATIONS_PER_RECURRING) {
      console.warn(
        `[RecurringTransaction] Cap reached for recurring ${recurring.id}. ` +
          `Generated ${generationCount} transactions. Remaining will be generated in next run.`,
      );
      break;
    }
    // ... lógica existente de criação
    generationCount++;
  }
  ```

- [ ] **1.4.3** — Garantir que `recurring.lastGenerated` é atualizado com a última data gerada mesmo quando o cap é atingido (para que o próximo run continue de onde parou)
- [ ] **1.4.4** — Criar/atualizar testes unitários para o handler/service cobrindo o cenário de cap atingido

### Verificação

```bash
npm run test

# Teste manual: criar uma recorrência com startDate muito antigo
# Verificar que gera no máximo 365 transações e loga warning
# Verificar que na próxima execução, continua de onde parou
```

---

## Checklist de Conclusão da Phase 1

- [ ] Todas as 4 tarefas concluídas
- [ ] `npm run test` passa (0 falhas)
- [ ] Indexes existem no banco (`\d recurring_transactions`)
- [ ] Cron job processa 15+ recorrências (não limita a 10)
- [ ] Lock TTL é 300s no cron job, 120s no service
- [ ] Cap de 365 gera warning nos logs
- [ ] **Criar `docs/done/PHASE_1_DONE.md`** com:
  - O que foi implementado (lista de mudanças)
  - Arquivos modificados
  - Decisões tomadas durante a implementação
  - Métricas de antes vs depois (se aplicável)
  - Próximos passos: Phase 2 (Transferência Genérica) e/ou Phase 3 (Cartão de Crédito)
