# Tarefas 3.3–3.4 — Mapper, Presenter, DTOs e Handlers de Account

> **Contexto:** Após Tarefa 3.2 (entity), o Account reconhece `creditLimit`. Agora a camada de dados (mapper, presenter, DTOs de entrada, handlers de criação/edição) precisa incluir o campo.
> **Anterior:** [Tarefa 3.2 — Entity](./TASK_3.2_ENTITY.md)
> **Próxima:** [Tarefa 3.5 — Invoice Query](./TASK_3.5_INVOICE_QUERY.md)

---

## Tarefa 3.3 — Atualizar mapper e presenter

### Arquivos

- `src/infra/databases/drizzle/mappers/account.mapper.ts`
- `src/modules/account/presenters/Account.presenter.ts`

### Sub-tarefas

- [ ] **3.3.1** — Atualizar `AccountMapper.toDomain()`:

  ```ts
  creditLimit: raw.creditLimit !== null ? BigInt(raw.creditLimit) : null,
  ```

- [ ] **3.3.2** — Atualizar `AccountMapper.toDatabase()`:

  ```ts
  creditLimit: entity.creditLimit !== null ? Number(entity.creditLimit) : null,
  ```

- [ ] **3.3.3** — Atualizar `AccountPresenter.toHTTP()`:

  ```ts
  creditLimit: account.creditLimitDecimal,
  availableLimit: account.availableLimitDecimal,
  ```

---

## Tarefa 3.4 — Atualizar DTOs e handlers de Account

### Arquivos

- `src/modules/account/features/create-account/create-account.dto.ts`
- `src/modules/account/features/create-account/create-account.handler.ts`
- `src/modules/account/features/update-account/update-account.dto.ts`
- `src/modules/account/features/update-account/update-account.handler.ts`

### Sub-tarefas

- [ ] **3.4.1** — Atualizar `create-account.dto.ts`:

  ```ts
  const createAccountSchema = z
    .object({
      // ... campos existentes
      creditLimit: z.coerce
        .number()
        .positive("Limite deve ser positivo")
        .optional()
        .nullable(),
    })
    .refine(
      (data) => {
        if (data.type === AccountType.CREDIT_CARD) {
          return data.closingDay != null && data.dueDay != null;
        }
        return true;
      },
      {
        message:
          "Dia de fechamento e vencimento são obrigatórios para cartão de crédito",
        path: ["closingDay"],
      },
    );
  ```

- [ ] **3.4.2** — Atualizar `create-account.handler.ts` para converter `creditLimit` de decimal para cents:

  ```ts
  const creditLimitInCents = props.creditLimit
    ? MoneyUtils.toCents(props.creditLimit)
    : null;

  const accountOrError = Account.create({
    // ... campos existentes
    creditLimit: creditLimitInCents ? BigInt(creditLimitInCents) : null,
  });
  ```

- [ ] **3.4.3** — Atualizar `update-account.dto.ts`:

  ```ts
  creditLimit: z.coerce.number().positive('Limite deve ser positivo').optional().nullable(),
  ```

- [ ] **3.4.4** — Atualizar `update-account.handler.ts` para aplicar `creditLimit` se fornecido

- [ ] **3.4.5** — Criar/atualizar testes unitários dos DTOs:
  - Create: CREDIT_CARD sem closingDay → rejeita; com tudo → aceita; creditLimit negativo → rejeita
  - Update: creditLimit válido → aceita

---

## Verificação

```bash
npm run test -- --testPathPattern="create-account|update-account"
npm run test
```
