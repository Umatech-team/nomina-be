# Tarefa 3.6 — Nova feature: Pagar Fatura do Cartão

> **Contexto:** Após Tarefa 3.5 (visualizar fatura), o usuário vê a fatura. Agora precisa pagar. **Pagamento é um TRANSFER** da conta de origem para a conta do cartão — usa toda a infraestrutura da Phase 2.
> **Anterior:** [Tarefa 3.5 — Invoice Query](./TASK_3.5_INVOICE_QUERY.md)
> **Próxima:** [Tarefa 3.7 — Recurring Integration](./TASK_3.7_RECURRING_INTEGRATION.md)

---

## Design

```
Pagamento total:   sourceAccount.balance -= amount, creditCard.balance += amount
Pagamento parcial: mesmo fluxo, amount < totalFatura

Resultado: cria uma Transaction de tipo TRANSFER
  - accountId = sourceAccountId (conta que paga)
  - destinationAccountId = creditCardAccountId (cartão)
  - type = TRANSFER
  - title = "Pagamento fatura {nome do cartão}"
```

---

## Sub-tarefas

- [ ] **3.6.1** — Criar DTO (`src/modules/account/features/pay-credit-card-invoice/pay-credit-card-invoice.dto.ts`):

  ```ts
  const payCreditCardInvoiceSchema = z.object({
    sourceAccountId: z.string().uuid("ID da conta origem inválido"),
    amount: z.coerce.number().positive("Valor deve ser positivo"),
    description: z.string().optional().nullable(),
    categoryId: z
      .string()
      .uuid("ID da categoria inválido")
      .optional()
      .nullable(),
  });

  export type PayCreditCardInvoiceRequest = z.infer<
    typeof payCreditCardInvoiceSchema
  >;
  export const PayCreditCardInvoicePipe = new ZodValidationPipe(
    payCreditCardInvoiceSchema,
  );
  ```

- [ ] **3.6.2** — Criar handler (`src/modules/account/features/pay-credit-card-invoice/pay-credit-card-invoice.handler.ts`):

  ```ts
  type Request = PayCreditCardInvoiceRequest & TokenPayloadBase & { creditCardAccountId: string };
  type Errors = HttpException;
  type Response = Transaction;

  async execute(props: Request): Promise<Either<Errors, Response>> {
    // 1. Buscar credit card account, validar workspace
    // 2. Validar que é CREDIT_CARD
    // 3. Buscar source account, validar workspace
    // 4. Validar que source NÃO é CREDIT_CARD
    // 5. Validar que source !== creditCard
    // 6. Converter amount para cents
    // 7. Criar Transaction.create({
    //      accountId: sourceAccountId,
    //      destinationAccountId: creditCardAccountId,
    //      title: `Pagamento fatura ${creditCardAccount.name}`,
    //      type: 'TRANSFER',
    //    })
    // 8. Calcular balances e createWithBalanceUpdate
    // 9. return right(transaction)
  }
  ```

- [ ] **3.6.3** — Criar controller (`POST /account/:id/invoice/pay`)

- [ ] **3.6.4** — Registrar controller e handler no `Account.module.ts`

- [ ] **3.6.5** — Criar testes unitários do handler:
  - Credit card não encontrado → 404
  - Account não é CREDIT_CARD → 400
  - Source account não encontrada → 404
  - Source é CREDIT_CARD → 400
  - Source === creditCard → 400
  - Source de outro workspace → 403
  - Pagamento OK: transaction criada, balances corretos
  - Pagamento parcial: amount < fatura total → OK

---

## Verificação

```bash
npm run test -- --testPathPattern="pay-credit-card-invoice"
```
