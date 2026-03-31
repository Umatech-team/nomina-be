# Tarefa 3.1 — Migration: adicionar `credit_limit`

> **Contexto:** Primeira tarefa da fase. Phase 2 já está concluída (transfer genérico funcional).
> **Próxima:** [Tarefa 3.2 — Entity](./TASK_3.2_ENTITY.md)

---

## Schema atual da tabela `accounts`

```ts
// src/infra/databases/drizzle/schema.ts
export const accounts = pgTable("accounts", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: bigint("balance", { mode: "number" }).default(0).notNull(),
  icon: text("icon"),
  color: text("color"),
  closingDay: integer("closing_day"),
  dueDay: integer("due_day"),
});
```

---

## Sub-tarefas

- [ ] **3.1.1** — Criar migration Prisma:

  ```sql
  ALTER TABLE accounts ADD COLUMN credit_limit BIGINT;
  ```

  Comando: `npx prisma migrate dev --name add_credit_limit`

- [ ] **3.1.2** — Atualizar `src/infra/databases/drizzle/schema.ts`:

  ```ts
  // Na tabela accounts, adicionar:
  creditLimit: bigint('credit_limit', { mode: 'number' }),
  ```

- [ ] **3.1.3** — Rodar `npx drizzle-kit migrate`

---

## Verificação

```bash
psql -c "\d accounts" | grep credit_limit
npm run test
```
