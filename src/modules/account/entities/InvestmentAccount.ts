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

  get type(): string {
    return AccountType.INVESTMENT;
  }

  get patrimonyContribution(): bigint {
    return this.balance;
  }

  public credit(amount: bigint): Either<Error, void> {
    return this.creditBalance(amount);
  }

  public debit(amount: bigint): Either<Error, void> {
    return this.debitBalanceWithFloor(amount);
  }

  public applyExpenseEffect(amount: bigint): Either<Error, void> {
    return this.debit(amount);
  }

  public applyIncomeEffect(amount: bigint): Either<Error, void> {
    return this.credit(amount);
  }
}
