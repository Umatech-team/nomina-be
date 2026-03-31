# Roadmap: Recorrência + Transferência + Cartão de Crédito

## Visão Geral

Três fases para evoluir o sistema financeiro do Nomina:

| Fase  | Nome                                                             | Dependência | Objetivo                                                                       |
| ----- | ---------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| **1** | [Otimização de Recorrência](./PHASE_1_RECURRING_OPTIMIZATION.md) | Nenhuma     | Corrigir gargalos de escalabilidade no processamento de transações recorrentes |
| **2** | [Transferência Genérica](./phase-2/README.md)                    | Nenhuma     | Habilitar `TRANSFER` como operação atômica entre quaisquer duas contas         |
| **3** | [Cartão de Crédito](./phase-3/README.md)                         | Phase 2     | Tornar `CREDIT_CARD` funcional com fatura, ciclo de fechamento e pagamento     |

> **Fases 1 e 2 são paralelas** — podem ser desenvolvidas e deployadas independentemente.
> **Fase 3 depende da Fase 2** — usa a infraestrutura de transferência genérica para pagamento de fatura.

---

## Decisões Arquiteturais

| Decisão                                                       | Justificativa                                                                                                                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Saldo devedor** para cartão de crédito                      | Balance começa em 0, despesas tornam negativo, pagamento retorna a 0. Modelo mais intuitivo para o usuário (padrão Nubank/Mobills/Organizze)    |
| **Sem entidade `CreditCardInvoice` no MVP**                   | Ciclo de faturamento computado via query + `closingDay`. Evolui para entidade materializada quando precisar de pagamento parcial, mínimo, juros |
| **Transfer genérico** (`destinationAccountId` na Transaction) | Funciona para qualquer par: carteira↔corrente, corrente→investimento, corrente→cartão. Future-proof                                             |
| **`creditLimit`** na Account                                  | Limite disponível = `creditLimit + balance`. Simples e extensível                                                                               |
| **Invoice no Account module**                                 | Escoped à conta específica e seu ciclo, não é um report cross-account                                                                           |

---

## Fora de Escopo (futuro incremental)

- Juros e multa por atraso
- Pagamento mínimo da fatura
- Parcelamento de compras
- Score de crédito
- Notificações de vencimento

---

## Fluxo de Trabalho

Para cada tarefa dentro de cada fase:

1. **Antes de começar**: leia a seção "Contexto" da tarefa para entender o que já foi feito
2. **Execute**: siga os sub-passos técnicos descritos
3. **Valide**: execute os testes indicados na seção "Verificação"
4. **Documente**: ao finalizar a fase completa, crie um doc `docs/done/PHASE_X_DONE.md` com:
   - O que foi implementado
   - Arquivos modificados/criados
   - Decisões tomadas durante a implementação
   - Próximos passos (próxima fase)

---

## Estrutura de Docs

```
docs/
  phases/
    ROADMAP.md                              ← este arquivo
    PHASE_1_RECURRING_OPTIMIZATION.md       ← tarefas da fase 1 (arquivo único, < 300 linhas)
    phase-2/
      README.md                             ← overview + estado atual + checklist
      TASK_2.1_MIGRATION.md
      TASK_2.2_ENTITY.md
      TASK_2.3_2.4_DATA_LAYER.md
      TASK_2.5_REPOSITORY.md
      TASK_2.6_2.7_CREATE_DELETE.md
      TASK_2.8_2.9_UPDATE_TOGGLE.md
      TASK_2.10_RECURRING.md
    phase-3/
      README.md                             ← overview + estado atual + checklist
      TASK_3.1_MIGRATION.md
      TASK_3.2_ENTITY.md
      TASK_3.3_3.4_DATA_LAYER.md
      TASK_3.5_INVOICE_QUERY.md
      TASK_3.6_INVOICE_PAYMENT.md
      TASK_3.7_RECURRING_INTEGRATION.md
  done/
    PHASE_1_DONE.md                         ← criado ao finalizar fase 1
    PHASE_2_DONE.md                         ← criado ao finalizar fase 2
    PHASE_3_DONE.md                         ← criado ao finalizar fase 3
```
