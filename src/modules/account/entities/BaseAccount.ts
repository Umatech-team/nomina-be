import { Either, left, right } from '@shared/core/errors/Either';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';

export interface BaseAccountProps {
  workspaceId: string;
  name: string;
  timezone: string;
  balance: bigint;
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

  get balance(): bigint {
    return this.props.balance;
  }

  /**
   * Soma o valor ao saldo. Compartilhado pelas contas cujo crédito não tem
   * regra própria (carteira, investimento, conta corrente).
   */
  protected creditBalance(amount: bigint): Either<Error, void> {
    if (amount <= 0n) return left(new Error('Valor deve ser positivo.'));
    this.props.balance += amount;
    return right(undefined);
  }

  /**
   * Subtrai o valor do saldo, bloqueando a operação se o resultado ficar
   * negativo. Compartilhado pelas contas que não permitem saldo negativo.
   */
  protected debitBalanceWithFloor(amount: bigint): Either<Error, void> {
    if (amount <= 0n) return left(new Error('Valor deve ser positivo.'));
    if (this.props.balance - amount < 0n) {
      return left(
        new Error('Saldo insuficiente na carteira. Operação bloqueada.'),
      );
    }
    this.props.balance -= amount;
    return right(undefined);
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
