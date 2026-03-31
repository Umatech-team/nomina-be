# Phase 2: Transferência Genérica entre Contas

> **Dependência:** Nenhuma (paralela com Phase 1)
> **Objetivo:** Habilitar o tipo `TRANSFER` para mover dinheiro entre quaisquer duas contas atomicamente.
> **Pré-requisito para:** Phase 3 (Cartão de Crédito) — o pagamento de fatura é um TRANSFER especializado.

---

## Estado Atual

O enum `TransactionType` já inclui `TRANSFER`, mas a implementação é incompleta:

- **create-transaction handler**: trata TRANSFER como EXPENSE (só subtrai do `accountId`), sem conta destino
- **Transaction entity**: não possui campo `destinationAccountId`
- **Schema `transactions`**: não possui coluna `destination_account_id`
- **Repository**: os 4 métodos atômicos (`createWithBalanceUpdate`, `updateWithBalanceUpdate`, `deleteWithBalanceReversion`, `toggleStatusWithBalanceUpdate`) operam em apenas 1 conta

### Lógica atual de balance no create-transaction

```ts
// src/modules/transaction/features/create-transaction/create-transaction.handle.ts
const newBalance =
  account.balance +
  (type === "INCOME" ? transaction.amount : -transaction.amount);

await this.transactionRepository.createWithBalanceUpdate(
  transaction,
  Number(newBalance),
);
```

### Signatures atuais dos métodos atômicos no repository

```ts
// src/modules/transaction/repositories/contracts/TransactionRepository.ts
abstract createWithBalanceUpdate(transaction: Transaction, newBalance: number): Promise<void>;
abstract updateWithBalanceUpdate(newTransaction: Transaction, newBalance: number): Promise<void>;
abstract deleteWithBalanceReversion(transaction: Transaction, newBalance: number): Promise<void>;
abstract toggleStatusWithBalanceUpdate(transactionId: string, newBalance: number): Promise<Transaction>;
```

---

## Tarefas

| Tarefa  | Documento                                          | Escopo                                          |
| ------- | -------------------------------------------------- | ----------------------------------------------- |
| 2.1     | [Migration](./TASK_2.1_MIGRATION.md)               | Adicionar `destination_account_id` no schema    |
| 2.2     | [Entity](./TASK_2.2_ENTITY.md)                     | Atualizar Transaction entity                    |
| 2.3–2.4 | [Data Layer](./TASK_2.3_2.4_DATA_LAYER.md)         | DTOs, mapper e presenter                        |
| 2.5     | [Repository](./TASK_2.5_REPOSITORY.md)             | Contract + implementação Drizzle (dual-account) |
| 2.6–2.7 | [Create + Delete](./TASK_2.6_2.7_CREATE_DELETE.md) | Handlers de criação e deleção                   |
| 2.8–2.9 | [Update + Toggle](./TASK_2.8_2.9_UPDATE_TOGGLE.md) | Handlers de edição e toggle de status           |
| 2.10    | [Recurring](./TASK_2.10_RECURRING.md)              | Integração com recorrência                      |

---

## Checklist de Conclusão

- [ ] Todas as 10 tarefas concluídas
- [ ] `npm run test` passa (0 falhas)
- [ ] Coluna `destination_account_id` existe na tabela `transactions`
- [ ] TRANSFER cria com 2 contas atualizadas atomicamente
- [ ] DELETE TRANSFER reverte ambas contas
- [ ] UPDATE TRANSFER lida com mudança de tipo e destino
- [ ] TOGGLE TRANSFER afeta ambas contas
- [ ] Recorrência TRANSFER gera com `destinationAccountId`
- [ ] DTOs validam `destinationAccountId` obrigatório para TRANSFER
- [ ] Presenter retorna `destinationAccountId`
- [ ] **Criar `docs/done/PHASE_2_DONE.md`** com:
  - O que foi implementado (lista de mudanças)
  - Arquivos modificados/criados
  - Cenários de balance calculados (tabela)
  - Decisões tomadas durante a implementação
  - Próximos passos: Phase 3 (Cartão de Crédito) — agora desbloqueada
