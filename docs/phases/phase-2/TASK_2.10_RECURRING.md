# Tarefa 2.10 — Integração com Recorrência

> **Contexto:** Após Tarefas 2.1–2.9, o TRANSFER funciona para transações normais. Mas transações recorrentes do tipo TRANSFER também geram transações — precisam incluir `destinationAccountId`.
> **Anterior:** [Tarefas 2.8–2.9 — Update + Toggle](./TASK_2.8_2.9_UPDATE_TOGGLE.md)

---

## Arquivos

- `src/modules/transaction/services/generate-recurring-transactions.service.ts`
- `src/modules/transaction/entities/RecurringTransaction.ts`
- `src/infra/databases/drizzle/schema.ts` (tabela `recurringTransactions`)
- `src/infra/databases/drizzle/mappers/recurring-transaction.mapper.ts`
- `src/modules/transaction/presenters/RecurringTransaction.presenter.ts`
- DTOs de recurring transaction (create, update)

---

## Sub-tarefas

- [ ] **2.10.1** — Verificar se `RecurringTransaction` entity já possui `destinationAccountId` — se não, adicionar:
  - Novo campo no `RecurringTransactionProps`
  - Getter/setter
  - Validação: se type === TRANSFER, obrigatório

- [ ] **2.10.2** — Adicionar `destination_account_id` na tabela `recurring_transactions` (migration) se necessário

- [ ] **2.10.3** — Atualizar `generate-recurring-transactions.service.ts` para passar `destinationAccountId` ao criar `Transaction.create()`:

  ```ts
  const transactionOrError = Transaction.create({
    // ... campos existentes
    destinationAccountId: recurring.destinationAccountId,
  });
  ```

- [ ] **2.10.4** — Atualizar recurring transaction DTOs, mapper, presenter para incluir o campo

- [ ] **2.10.5** — Atualizar testes

---

## Verificação

```bash
npm run test
```
