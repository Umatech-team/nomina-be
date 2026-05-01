import { AccountType } from '@constants/enums';
import { Either, left, right } from '@shared/core/errors/Either';
import { BaseAccount, BaseAccountProps } from './BaseAccount';

export interface CashAccountProps extends BaseAccountProps {
  balance: bigint;
}

export class CashAccount extends BaseAccount<CashAccountProps> {
  private constructor(props: CashAccountProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<CashAccountProps, 'balance'> & { balance?: bigint },
    id?: string,
  ): Either<Error, CashAccount> {
    const initialBalance = props.balance ?? 0n;
    if (initialBalance < 0n)
      return left(new Error('Dinheiro em espécie não pode ser negativo.'));

    return right(new CashAccount({ ...props, balance: initialBalance }, id));
  }

  static reconstitute(props: CashAccountProps, id: string): CashAccount {
    return new CashAccount(props, id);
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get type(): string {
    return AccountType.CASH;
  }

  get patrimonyContribution(): bigint {
    return this.balance;
  }

  public credit(amount: bigint): Either<Error, void> {
    if (amount <= 0n) return left(new Error('Valor deve ser positivo.'));
    this.props.balance += amount;
    return right(undefined);
  }

  public debit(amount: bigint): Either<Error, void> {
    if (amount <= 0n) return left(new Error('Valor deve ser positivo.'));
    if (this.props.balance - amount < 0n) {
      return left(
        new Error('Saldo insuficiente na carteira. Operação bloqueada.'),
      );
    }
    this.props.balance -= amount;
    return right(undefined);
  }
}
