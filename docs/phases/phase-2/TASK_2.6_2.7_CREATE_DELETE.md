# Tarefas 2.6–2.7 — Handlers: Create + Delete Transaction

> **Contexto:** Após Tarefas 2.1–2.5, toda a infraestrutura suporta dual-account. Agora os handlers de criação e deleção precisam implementar a lógica de negócio para TRANSFER.
> **Anterior:** [Tarefa 2.5 — Repository](./TASK_2.5_REPOSITORY.md)
> **Próxima:** [Tarefas 2.8–2.9 — Update + Toggle](./TASK_2.8_2.9_UPDATE_TOGGLE.md)

---

## Tarefa 2.6 — Atualizar create-transaction handler

### Arquivos

- `src/modules/transaction/features/create-transaction/create-transaction.handle.ts`
- `src/modules/account/repositories/contracts/AccountRepository.ts` — para buscar conta destino

### Sub-tarefas

- [ ] **2.6.1** — Injetar `AccountRepository` (se ainda não injetado) para buscar conta destino

- [ ] **2.6.2** — Adicionar lógica de TRANSFER no handler:

  ```ts
  if (type === "TRANSFER") {
    // 1. Buscar conta destino
    const destinationAccount =
      await this.accountRepository.findById(destinationAccountId);
    if (!destinationAccount)
      return left(
        new HttpException("Conta destino não encontrada", statusCode.NOT_FOUND),
      );
    if (destinationAccount.workspaceId !== workspaceId)
      return left(
        new HttpException(
          "Conta destino não pertence ao workspace",
          statusCode.FORBIDDEN,
        ),
      );

    // 2. Calcular novos balances
    const sourceNewBalance = Number(account.balance - transaction.amount);
    const destNewBalance = Number(
      destinationAccount.balance + transaction.amount,
    );

    // 3. Criar com dual-account update
    await this.transactionRepository.createWithBalanceUpdate(
      transaction,
      sourceNewBalance,
      destNewBalance,
    );
  } else {
    // Lógica existente para INCOME/EXPENSE
    const newBalance =
      account.balance +
      (type === "INCOME" ? transaction.amount : -transaction.amount);
    await this.transactionRepository.createWithBalanceUpdate(
      transaction,
      Number(newBalance),
    );
  }
  ```

- [ ] **2.6.3** — Criar/atualizar testes unitários do handler:
  - TRANSFER: ambas contas atualizadas (source −, destination +)
  - TRANSFER: conta destino não encontrada → `isLeft()` 404
  - TRANSFER: conta destino de outro workspace → `isLeft()` 403
  - TRANSFER: `destinationAccountId === accountId` → `isLeft()` (validação na entity)
  - INCOME/EXPENSE: comportamento não alterado (regressão)

### Verificação

```bash
npm run test -- --testPathPattern="create-transaction"
```

---

## Tarefa 2.7 — Atualizar delete-transaction handler

### Arquivos

- `src/modules/transaction/features/delete-transaction/delete-transaction.handler.ts`

### Sub-tarefas

- [ ] **2.7.1** — Atualizar lógica de deleção:

  ```ts
  if (transaction.type === "TRANSFER" && transaction.destinationAccountId) {
    const destinationAccount = await this.accountRepository.findById(
      transaction.destinationAccountId,
    );
    const sourceNewBalance = Number(account.balance + transaction.amount);
    const destNewBalance = destinationAccount
      ? Number(destinationAccount.balance - transaction.amount)
      : undefined;

    await this.transactionRepository.deleteWithBalanceReversion(
      transaction,
      sourceNewBalance,
      destNewBalance,
    );
  } else {
    // Lógica existente
    const newBalance = account.balance - transaction.amount;
    await this.transactionRepository.deleteWithBalanceReversion(
      transaction,
      Number(newBalance),
    );
  }
  ```

- [ ] **2.7.2** — Injetar `AccountRepository` se necessário

- [ ] **2.7.3** — Criar/atualizar testes unitários:
  - Delete TRANSFER: ambas contas revertidas
  - Delete INCOME/EXPENSE: regressão ok

### Verificação

```bash
npm run test -- --testPathPattern="delete-transaction"
```
