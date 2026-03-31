# Tarefa 2.5 — Repository contract + implementação Drizzle

> **Contexto:** Após Tarefas 2.1–2.4, tudo reconhece `destinationAccountId`. Agora os 4 métodos atômicos do repositório precisam suportar atualizar 2 contas dentro da mesma DB transaction.
> **Anterior:** [Tarefas 2.3–2.4 — Data Layer](./TASK_2.3_2.4_DATA_LAYER.md)
> **Próxima:** [Tarefas 2.6–2.7 — Create + Delete](./TASK_2.6_2.7_CREATE_DELETE.md)

---

## Arquivos

- `src/modules/transaction/repositories/contracts/TransactionRepository.ts` — signatures atuais (1 conta)
- `src/infra/databases/drizzle/repositories/transaction.repository.ts` — implementação Drizzle (1 conta)

---

## Sub-tarefas

- [ ] **2.5.1** — Atualizar signatures no contract abstrato:

  ```ts
  abstract createWithBalanceUpdate(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void>;

  abstract updateWithBalanceUpdate(
    newTransaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
    oldDestinationAccountId?: string | null,
    oldDestinationNewBalance?: number,
  ): Promise<void>;

  abstract deleteWithBalanceReversion(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void>;

  abstract toggleStatusWithBalanceUpdate(
    transactionId: string,
    sourceNewBalance: number,
    destinationAccountId?: string | null,
    destinationNewBalance?: number,
  ): Promise<Transaction>;
  ```

- [ ] **2.5.2** — Implementar no Drizzle — `createWithBalanceUpdate`:

  ```ts
  async createWithBalanceUpdate(
    transaction: Transaction,
    sourceNewBalance: number,
    destinationNewBalance?: number,
  ): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      await tx.insert(schema.transactions)
        .values(TransactionMapper.toDatabase(transaction));

      await tx.update(schema.accounts)
        .set({ balance: sourceNewBalance })
        .where(eq(schema.accounts.id, transaction.accountId));

      if (transaction.destinationAccountId && destinationNewBalance !== undefined) {
        await tx.update(schema.accounts)
          .set({ balance: destinationNewBalance })
          .where(eq(schema.accounts.id, transaction.destinationAccountId));
      }
    });
  }
  ```

- [ ] **2.5.3** — Implementar no Drizzle — `updateWithBalanceUpdate`:
  - Atualizar source account balance
  - Se a transação antiga tinha `destinationAccountId` diferente da nova: reverter balance da antiga destination, aplicar na nova
  - Se mesma destination: recalcular balance

- [ ] **2.5.4** — Implementar no Drizzle — `deleteWithBalanceReversion`:

  ```ts
  // Dentro da DB transaction:
  // 1. DELETE transaction
  // 2. UPDATE source account balance (revert)
  // 3. IF destinationAccountId: UPDATE destination account balance (revert)
  ```

- [ ] **2.5.5** — Implementar no Drizzle — `toggleStatusWithBalanceUpdate`:

  ```ts
  // Dentro da DB transaction:
  // 1. Toggle status
  // 2. UPDATE source account balance
  // 3. IF destinationAccountId: UPDATE destination account balance
  ```

---

## Verificação

```bash
npm run test
```
