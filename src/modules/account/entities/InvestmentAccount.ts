import { AccountType } from '@constants/enums';
import { Either, left, right } from '@shared/core/errors/Either';
import { BaseAccount, BaseAccountProps } from './BaseAccount';

export interface InvestmentAccountProps extends BaseAccountProps {
  balance: bigint;
}

export class InvestmentAccount extends BaseAccount<InvestmentAccountProps> {
  private constructor(props: InvestmentAccountProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<InvestmentAccountProps, 'balance'> & { balance?: bigint },
    id?: string,
  ): Either<Error, InvestmentAccount> {
    const initialBalance = props.balance ?? 0n;
    if (initialBalance < 0n)
      return left(new Error('Saldo inicial não pode ser negativo.'));

    return right(
      new InvestmentAccount({ ...props, balance: initialBalance }, id),
    );
  }

  static reconstitute(
    props: InvestmentAccountProps,
    id: string,
  ): InvestmentAccount {
    return new InvestmentAccount(props, id);
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get type(): string {
    return AccountType.INVESTMENT;
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
