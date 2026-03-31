# Tarefa 2.2 — Atualizar Transaction entity

> **Contexto:** Após a Tarefa 2.1 (migration), o banco tem a coluna `destination_account_id`. Agora a entidade precisa refletir isso.
> **Anterior:** [Tarefa 2.1 — Migration](./TASK_2.1_MIGRATION.md)
> **Próxima:** [Tarefa 2.3–2.4 — Data Layer](./TASK_2.3_2.4_DATA_LAYER.md)

---

## Arquivos

- `src/modules/transaction/entities/Transaction.ts`

---

## Sub-tarefas

- [ ] **2.2.1** — Adicionar `destinationAccountId: string | null` ao `TransactionProps`:

  ```ts
  export interface TransactionProps {
    // ... campos existentes
    destinationAccountId: string | null; // ← novo
  }
  ```

- [ ] **2.2.2** — Adicionar `destinationAccountId` à lista de campos opcionais em `create()`:

  ```ts
  static create(
    props: Optional<
      TransactionProps,
      'createdAt' | 'updatedAt' | 'status' | 'recurringId' | 'description' | 'destinationAccountId'
    >,
    id?: string,
  ): Either<Error, Transaction>
  ```

- [ ] **2.2.3** — Adicionar validação no `create()`: se `type === 'TRANSFER'`, `destinationAccountId` é obrigatório e deve ser diferente de `accountId`:

  ```ts
  if (props.type === "TRANSFER") {
    if (!props.destinationAccountId) {
      return left(new Error("Conta destino é obrigatória para transferências"));
    }
    if (props.destinationAccountId === props.accountId) {
      return left(
        new Error("Conta destino deve ser diferente da conta origem"),
      );
    }
  }
  ```

- [ ] **2.2.4** — Adicionar getter e setter:

  ```ts
  get destinationAccountId(): string | null { return this.props.destinationAccountId; }
  set destinationAccountId(value: string | null) { this.props.destinationAccountId = value; this.touch(); }
  ```

- [ ] **2.2.5** — Default `destinationAccountId` para `null` no `create()` se não fornecido

- [ ] **2.2.6** — Criar/atualizar testes unitários da entity:
  - TRANSFER sem `destinationAccountId` → `isLeft()` com erro
  - TRANSFER com `destinationAccountId === accountId` → `isLeft()` com erro
  - TRANSFER com `destinationAccountId` válido → `isRight()`
  - INCOME/EXPENSE sem `destinationAccountId` → `isRight()` (campo nullable)

---

## Verificação

```bash
npm run test -- --testPathPattern="Transaction.spec"
```
