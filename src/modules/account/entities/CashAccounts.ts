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

  get type(): string {
    return AccountType.CASH;
  }

  get patrimonyContribution(): bigint {
    return this.balance;
  }

  public applyExpenseEffect(amount: bigint): Either<Error, void> {
    return this.debit(amount);
  }

  public applyIncomeEffect(amount: bigint): Either<Error, void> {
    return this.credit(amount);
  }
}
