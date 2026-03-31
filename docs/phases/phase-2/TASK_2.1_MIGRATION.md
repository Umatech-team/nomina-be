# Tarefa 2.1 — Migration: adicionar `destination_account_id`

> **Contexto:** Primeira tarefa da fase. Não depende de nada anterior.
> **Próxima:** [Tarefa 2.2 — Entity](./TASK_2.2_ENTITY.md)

---

## Sub-tarefas

- [ ] **2.1.1** — Criar migration Prisma:

  ```sql
  ALTER TABLE transactions
    ADD COLUMN destination_account_id TEXT
    REFERENCES accounts(id) ON DELETE RESTRICT;

  CREATE INDEX idx_trans_destination_account ON transactions (destination_account_id);
  ```

  Comando: `npx prisma migrate dev --name add_destination_account_id`

- [ ] **2.1.2** — Atualizar `src/infra/databases/drizzle/schema.ts`:
  - Adicionar coluna na tabela `transactions`:
    ```ts
    destinationAccountId: text('destination_account_id').references(
      () => accounts.id,
      { onDelete: 'restrict' },
    ),
    ```
  - Adicionar index na seção de indexes:
    ```ts
    index('idx_trans_destination_account').on(table.destinationAccountId),
    ```

- [ ] **2.1.3** — Rodar `npx drizzle-kit migrate` para sincronizar Drizzle

---

## Verificação

```bash
psql -c "\d transactions" | grep destination
npm run test
```
