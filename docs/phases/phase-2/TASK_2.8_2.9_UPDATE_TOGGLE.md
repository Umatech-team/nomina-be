# Tarefas 2.8–2.9 — Handlers: Update + Toggle Status

> **Contexto:** Após Tarefas 2.6–2.7 (create e delete), transfers podem ser criados e deletados. Agora update e toggle precisam lidar com dual-account.
> **Anterior:** [Tarefas 2.6–2.7 — Create + Delete](./TASK_2.6_2.7_CREATE_DELETE.md)
> **Próxima:** [Tarefa 2.10 — Recurring](./TASK_2.10_RECURRING.md)

---

## Tarefa 2.8 — Atualizar update-transaction handler

Este é o mais complexo porque pode haver mudança de tipo (EXPENSE → TRANSFER) ou mudança de conta destino.

### Arquivos

- `src/modules/transaction/features/update-transaction/update-transaction.handler.ts`

### Sub-tarefas

- [ ] **2.8.1** — Mapear os cenários de update:

  | Cenário                              | Ação no Balance                                                                      |
  | ------------------------------------ | ------------------------------------------------------------------------------------ |
  | EXPENSE → EXPENSE (mesmo account)    | Reverter amount antigo, aplicar novo                                                 |
  | EXPENSE → TRANSFER                   | Reverter amount antigo no source, aplicar −amount no source + +amount na destination |
  | TRANSFER → EXPENSE                   | Reverter source e destination antigos, aplicar −amount no source                     |
  | TRANSFER → TRANSFER (mesma dest)     | Reverter amounts antigos, aplicar novos                                              |
  | TRANSFER → TRANSFER (dest diferente) | Reverter amounts antigos em source e old dest, aplicar novos em source e new dest    |

- [ ] **2.8.2** — Implementar o handler cobrindo todos os cenários:
  - Reverter todos os balances antigos primeiro
  - Aplicar todos os balances novos em seguida
  - Uma única DB transaction faz tudo

- [ ] **2.8.3** — Criar/atualizar testes unitários cobrindo os cenários mais críticos:
  - TRANSFER → TRANSFER com mudança de destination
  - EXPENSE → TRANSFER
  - TRANSFER → EXPENSE

### Verificação

```bash
npm run test -- --testPathPattern="update-transaction"
```

---

## Tarefa 2.9 — Atualizar toggle-transaction-status handler

### Arquivos

- `src/modules/transaction/features/toggle-transaction-status/toggle-transaction-status.handler.ts`

### Sub-tarefas

- [ ] **2.9.1** — Atualizar lógica de toggle:

  ```ts
  if (transaction.type === "TRANSFER" && transaction.destinationAccountId) {
    const destinationAccount = await this.accountRepository.findById(
      transaction.destinationAccountId,
    );

    if (transaction.status === TransactionStatus.PENDING) {
      // PENDING → COMPLETED: aplicar em ambas
      sourceNewBalance = Number(account.balance - transaction.amount);
      destNewBalance = Number(destinationAccount.balance + transaction.amount);
    } else {
      // COMPLETED → PENDING: reverter em ambas
      sourceNewBalance = Number(account.balance + transaction.amount);
      destNewBalance = Number(destinationAccount.balance - transaction.amount);
    }

    return this.transactionRepository.toggleStatusWithBalanceUpdate(
      transaction.id,
      sourceNewBalance,
      transaction.destinationAccountId,
      destNewBalance,
    );
  }
  ```

- [ ] **2.9.2** — Injetar `AccountRepository` se necessário

- [ ] **2.9.3** — Criar/atualizar testes unitários:
  - Toggle TRANSFER PENDING→COMPLETED: ambas contas atualizadas
  - Toggle TRANSFER COMPLETED→PENDING: ambas contas revertidas
  - Toggle INCOME/EXPENSE: regressão ok

### Verificação

```bash
npm run test -- --testPathPattern="toggle-transaction-status"
```
