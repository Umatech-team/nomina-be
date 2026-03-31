# Phase 3: Cartão de Crédito

> **Dependência:** Phase 2 (Transferência Genérica) — pagamento de fatura usa TRANSFER
> **Objetivo:** Tornar `CREDIT_CARD` account type totalmente funcional com limite de crédito, visualização de fatura por ciclo de fechamento, e pagamento de fatura.

---

## Estado Atual

O sistema já possui a base para cartão de crédito:

- **`AccountType.CREDIT_CARD`** existe no enum `src/constants/enums.ts`
- **`closingDay`** e **`dueDay`** existem na tabela `accounts` e na entity `Account` (opcionais)
- **Nenhuma lógica especial** para CREDIT_CARD — funciona igual a qualquer outra conta
- **Não possui:** `creditLimit`, visualização por fatura, pagamento de fatura

### Modelo de saldo adotado: **Saldo Devedor**

| Ação                | Efeito no balance                   |
| ------------------- | ----------------------------------- |
| Despesa no cartão   | balance **diminui** (fica negativo) |
| Pagamento da fatura | balance **aumenta** (volta pra 0)   |
| Balance = 0         | Sem dívida                          |
| Balance = -15000    | Deve R$ 150,00                      |

> **Limite disponível** = `creditLimit + balance`
> Ex: limite R$ 5.000 + balance -R$ 1.500 = R$ 3.500 disponível

---

## Tarefas

| Tarefa  | Documento                                        | Escopo                                        |
| ------- | ------------------------------------------------ | --------------------------------------------- |
| 3.1     | [Migration](./TASK_3.1_MIGRATION.md)             | Adicionar `credit_limit` no schema            |
| 3.2     | [Entity](./TASK_3.2_ENTITY.md)                   | Atualizar Account entity                      |
| 3.3–3.4 | [Data Layer](./TASK_3.3_3.4_DATA_LAYER.md)       | Mapper, presenter, DTOs e handlers de Account |
| 3.5     | [Invoice Query](./TASK_3.5_INVOICE_QUERY.md)     | Nova feature: consultar fatura do cartão      |
| 3.6     | [Invoice Payment](./TASK_3.6_INVOICE_PAYMENT.md) | Nova feature: pagar fatura do cartão          |
| 3.7     | [Recurring](./TASK_3.7_RECURRING_INTEGRATION.md) | Validar integração com recorrência            |

---

## Checklist de Conclusão

- [ ] Todas as 7 tarefas concluídas
- [ ] `npm run test` passa (0 falhas)
- [ ] Coluna `credit_limit` existe na tabela `accounts`
- [ ] CREDIT_CARD exige `closingDay` e `dueDay` na criação
- [ ] `GET /account/:id/invoice?month=3&year=2026` retorna fatura com período correto
- [ ] `POST /account/:id/invoice/pay` cria TRANSFER e atualiza ambas contas
- [ ] Presenter retorna `creditLimit` e `availableLimit`
- [ ] Recorrência em cartão funciona normalmente
- [ ] **Criar `docs/done/PHASE_3_DONE.md`** com:
  - O que foi implementado (lista de mudanças)
  - Arquivos modificados/criados
  - Endpoints novos (com exemplos de request/response)
  - Decisões tomadas durante a implementação
  - Modelo de saldo devedor explicado
  - Futuro: parcelamento, juros, pagamento mínimo, notificações
