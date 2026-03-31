# Tarefa 3.7 — Validar integração com recorrência

> **Contexto:** Após Tarefas 3.1–3.6, cartão funcional. Última tarefa: confirmar que recorrências em cartão de crédito funcionam naturalmente.
> **Anterior:** [Tarefa 3.6 — Invoice Payment](./TASK_3.6_INVOICE_PAYMENT.md)

---

## Sub-tarefas

- [ ] **3.7.1** — Teste manual ou automatizado:
  1. Criar conta CREDIT_CARD com creditLimit
  2. Criar RecurringTransaction de tipo EXPENSE vinculada ao cartão
  3. Triggerar geração (listar transações ou cron job)
  4. Verificar que transações PENDING foram criadas
  5. Verificar que balance do cartão foi ajustado (se transações PENDING impactam — verificar política)

- [ ] **3.7.2** — Documentar o comportamento:
  - Recorrência EXPENSE em cartão: gera transações PENDING, NÃO afetam balance até toggle para COMPLETED
  - Recorrência TRANSFER em cartão (pagamento automático de fatura): requer `destinationAccountId` na RecurringTransaction (implementado na Phase 2 Tarefa 2.10)

---

## Verificação

```bash
npm run test
```
