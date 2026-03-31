# Tarefas 2.3–2.4 — DTOs, Mapper e Presenter

> **Contexto:** Após Tarefas 2.1–2.2 (schema + entity), a coluna existe no banco e a entidade a reconhece. Agora a camada de dados (DTOs de entrada, mapper DB↔entity, presenter de saída) precisa incluir `destinationAccountId`.
> **Anterior:** [Tarefa 2.2 — Entity](./TASK_2.2_ENTITY.md)
> **Próxima:** [Tarefa 2.5 — Repository](./TASK_2.5_REPOSITORY.md)

---

## Tarefa 2.3 — Atualizar DTOs

### Arquivos

- `src/modules/transaction/features/create-transaction/create-transaction.dto.ts`
- `src/modules/transaction/features/update-transaction/update-transaction.dto.ts`

### Sub-tarefas

- [ ] **2.3.1** — Atualizar `create-transaction.dto.ts`:

  ```ts
  const createTransactionSchema = z
    .object({
      // ... campos existentes
      destinationAccountId: z
        .string()
        .uuid("ID da conta destino inválido")
        .optional()
        .nullable(),
    })
    .refine(
      (data) => {
        if (data.type === TransactionType.TRANSFER) {
          return !!data.destinationAccountId;
        }
        return true;
      },
      {
        message: "Conta destino é obrigatória para transferências",
        path: ["destinationAccountId"],
      },
    );
  ```

- [ ] **2.3.2** — Atualizar `update-transaction.dto.ts`:

  ```ts
  // Adicionar campo opcional (sem refine, pois update não exige type)
  destinationAccountId: z.string().uuid('ID da conta destino inválido').optional().nullable(),
  ```

- [ ] **2.3.3** — Criar/atualizar testes unitários dos DTOs:
  - `create-transaction.dto.spec.ts`: TRANSFER sem `destinationAccountId` → rejeita; com UUID válido → aceita; INCOME sem → aceita
  - `update-transaction.dto.spec.ts`: UUID inválido → rejeita; UUID válido → aceita

---

## Tarefa 2.4 — Atualizar mapper e presenter

### Arquivos

- `src/infra/databases/drizzle/mappers/transaction.mapper.ts`
- `src/modules/transaction/presenters/Transaction.presenter.ts`

### Sub-tarefas

- [ ] **2.4.1** — Atualizar `TransactionMapper.toDomain()`:

  ```ts
  destinationAccountId: raw.destinationAccountId ?? null,
  ```

- [ ] **2.4.2** — Atualizar `TransactionMapper.toDatabase()`:

  ```ts
  destinationAccountId: entity.destinationAccountId,
  ```

- [ ] **2.4.3** — Atualizar `TransactionPresenter.toHTTP()`:

  ```ts
  destinationAccountId: transaction.destinationAccountId,
  ```

---

## Verificação

```bash
npm run test -- --testPathPattern="create-transaction.dto|update-transaction.dto"
npm run test
```
