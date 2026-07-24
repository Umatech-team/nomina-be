import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either } from '@shared/core/errors/Either';

export interface BaseAccountProps {
  workspaceId: string;
  name: string;
  timezone: string;
}

export abstract class BaseAccount<
  T extends BaseAccountProps,
> extends AggregateRoot<T> {
  protected constructor(props: T, id?: string) {
    super(props, id);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  public updateName(name: string) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Nome inválido.');
    }
    this.props.name = name.trim();
  }

  abstract get patrimonyContribution(): bigint;

  abstract get type(): string;

  /**
   * Efeito de uma transação EXPENSE sobre a conta. Contas comuns debitam o
   * saldo; o cartão de crédito registra a cobrança na fatura (aumenta a dívida).
   */
  abstract applyExpenseEffect(amount: bigint): Either<Error, void>;

  /**
   * Efeito de uma transação INCOME sobre a conta. Contas comuns creditam o
   * saldo; o cartão de crédito abate o valor da fatura (diminui a dívida).
   */
  abstract applyIncomeEffect(amount: bigint): Either<Error, void>;
}
