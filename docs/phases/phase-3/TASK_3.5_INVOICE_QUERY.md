# Tarefa 3.5 — Nova feature: Consultar Fatura do Cartão

> **Contexto:** Após Tarefas 3.1–3.4, CREDIT_CARD tem `creditLimit` e validação. Agora a feature de visualização de fatura.
> **Anterior:** [Tarefas 3.3–3.4 — Data Layer](./TASK_3.3_3.4_DATA_LAYER.md)
> **Próxima:** [Tarefa 3.6 — Invoice Payment](./TASK_3.6_INVOICE_PAYMENT.md)

---

## Design da fatura (sem entidade separada)

A fatura é **computada em tempo real** a partir das transações existentes do cartão, filtradas pelo ciclo de fechamento:

```
Período da fatura: closingDay+1 do mês anterior → closingDay do mês alvo

Exemplo: closingDay = 15
- Fatura de março/2026: 16/fev/2026 → 15/mar/2026
- Fatura de abril/2026: 16/mar/2026 → 15/abr/2026

Due date: dueDay do mês seguinte ao fechamento
- Fatura de março (fecha dia 15/mar): vence dia dueDay de abril
```

---

## Sub-tarefas

- [ ] **3.5.1** — Criar DTO (`src/modules/account/features/get-credit-card-invoice/get-credit-card-invoice.dto.ts`):

  ```ts
  const getCreditCardInvoiceSchema = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2020).max(2100).optional(),
  });

  export type GetCreditCardInvoiceRequest = z.infer<
    typeof getCreditCardInvoiceSchema
  >;
  export const GetCreditCardInvoicePipe = new ZodValidationPipe(
    getCreditCardInvoiceSchema,
  );
  ```

- [ ] **3.5.2** — Adicionar método no `TransactionRepository` contract:

  ```ts
  abstract findByAccountAndDateRange(
    accountId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>;
  ```

- [ ] **3.5.3** — Implementar no repositório Drizzle:

  ```ts
  async findByAccountAndDateRange(
    accountId: string, workspaceId: string,
    startDate: Date, endDate: Date,
  ): Promise<Transaction[]> {
    const rows = await this.drizzle.db
      .select()
      .from(schema.transactions)
      .where(and(
        eq(schema.transactions.accountId, accountId),
        eq(schema.transactions.workspaceId, workspaceId),
        gte(schema.transactions.date, startDate),
        lte(schema.transactions.date, endDate),
      ))
      .orderBy(desc(schema.transactions.date));

    return rows.map(TransactionMapper.toDomain);
  }
  ```

- [ ] **3.5.4** — Criar handler (`src/modules/account/features/get-credit-card-invoice/get-credit-card-invoice.handler.ts`):

  ```ts
  type Request = GetCreditCardInvoiceRequest & TokenPayloadBase & { accountId: string };
  type Errors = HttpException;
  type Response = {
    account: Account;
    transactions: Transaction[];
    totalAmount: number;    // soma dos amounts (em cents)
    dueDate: Date;
    periodStart: Date;
    periodEnd: Date;
  };

  async execute(props: Request): Promise<Either<Errors, Response>> {
    // 1. Buscar account, validar workspace, validar tipo CREDIT_CARD
    // 2. Calcular período:
    //    - month/year default para mês/ano atual
    //    - periodEnd = new Date(year, month-1, closingDay)
    //    - periodStart = new Date(year, month-2, closingDay+1)
    //    - dueDate = new Date(year, month, dueDay)
    // 3. Buscar transações via findByAccountAndDateRange
    // 4. Somar amounts → totalAmount
    // 5. Retornar
  }
  ```

- [ ] **3.5.5** — Criar presenter (`src/modules/account/presenters/CreditCardInvoice.presenter.ts`):

  ```ts
  static toHTTP(data: Response) {
    return {
      account: AccountPresenter.toHTTP(data.account),
      transactions: data.transactions.map(TransactionPresenter.toHTTP),
      totalAmount: MoneyUtils.toDecimal(BigInt(data.totalAmount)),
      dueDate: data.dueDate.toISOString(),
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString(),
    };
  }
  ```

- [ ] **3.5.6** — Criar controller (`GET /account/:id/invoice?month=3&year=2026`)

- [ ] **3.5.7** — Registrar controller e handler no `Account.module.ts`

- [ ] **3.5.8** — Criar testes unitários do handler:
  - Account não encontrada → 404
  - Account não é CREDIT_CARD → 400
  - Account de outro workspace → 403
  - Período calculado corretamente (closingDay = 15, month = 3 → 16/fev–15/mar)
  - Soma dos amounts calculada corretamente
  - Mês/ano default para atual quando não fornecido

---

## Verificação

```bash
npm run test -- --testPathPattern="get-credit-card-invoice"
```
