# Tarefa 3.2 — Atualizar Account entity

> **Contexto:** Após Tarefa 3.1 (migration), o banco tem a coluna `credit_limit`. Agora a entidade precisa do campo, validação e getters computados.
> **Anterior:** [Tarefa 3.1 — Migration](./TASK_3.1_MIGRATION.md)
> **Próxima:** [Tarefas 3.3–3.4 — Data Layer](./TASK_3.3_3.4_DATA_LAYER.md)

---

## Entity Account atual

```ts
export interface AccountProps {
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: bigint;
  icon: string | null;
  color: string | null;
  closingDay: number | null;
  dueDay: number | null;
}
```

---

## Sub-tarefas

- [ ] **3.2.1** — Adicionar `creditLimit: bigint | null` ao `AccountProps`:

  ```ts
  export interface AccountProps {
    // ... campos existentes
    creditLimit: bigint | null;
  }
  ```

- [ ] **3.2.2** — Adicionar `'creditLimit'` à lista de opcionais no `create()`:

  ```ts
  static create(
    props: Optional<AccountProps, 'icon' | 'color' | 'closingDay' | 'dueDay' | 'creditLimit'>,
    id?: string,
  ): Either<HttpException, Account>
  ```

- [ ] **3.2.3** — Adicionar validação no `create()`:

  ```ts
  if (props.type === AccountType.CREDIT_CARD) {
    if (!props.closingDay)
      return left(
        new HttpException(
          "Dia de fechamento é obrigatório para cartão de crédito",
          statusCode.BAD_REQUEST,
        ),
      );
    if (!props.dueDay)
      return left(
        new HttpException(
          "Dia de vencimento é obrigatório para cartão de crédito",
          statusCode.BAD_REQUEST,
        ),
      );
  }

  if (
    props.creditLimit !== undefined &&
    props.creditLimit !== null &&
    props.creditLimit <= 0n
  ) {
    return left(
      new HttpException(
        "Limite de crédito deve ser positivo",
        statusCode.BAD_REQUEST,
      ),
    );
  }
  ```

- [ ] **3.2.4** — Adicionar getters e computed properties:

  ```ts
  get creditLimit(): bigint | null { return this.props.creditLimit; }
  set creditLimit(value: bigint | null) { this.props.creditLimit = value; }

  get creditLimitDecimal(): number | null {
    return this.props.creditLimit !== null
      ? MoneyUtils.toDecimal(this.props.creditLimit) : null;
  }

  get availableLimit(): bigint | null {
    if (this.props.creditLimit === null) return null;
    return this.props.creditLimit + this.props.balance;
  }

  get availableLimitDecimal(): number | null {
    return this.availableLimit !== null
      ? MoneyUtils.toDecimal(this.availableLimit) : null;
  }
  ```

- [ ] **3.2.5** — Default `creditLimit` para `null` no `create()`

- [ ] **3.2.6** — Criar/atualizar testes unitários:
  - CREDIT_CARD sem `closingDay` → `isLeft()`
  - CREDIT_CARD sem `dueDay` → `isLeft()`
  - CREDIT_CARD com tudo OK → `isRight()`
  - `creditLimit` negativo → `isLeft()`
  - `availableLimit` computado correto (5000 + (-1500) = 3500)
  - CHECKING com `creditLimit` → aceita (não bloqueia)

---

## Verificação

```bash
npm run test -- --testPathPattern="Account.spec"
```
