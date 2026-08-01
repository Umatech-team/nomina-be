import { AccountType } from '@constants/enums';
import { ValidationAccountError } from '@modules/account/errors';
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
      return left(
        new ValidationAccountError('Saldo inicial não pode ser negativo.'),
      );

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

  public applyExpenseEffect(amount: bigint): Either<Error, void> {
    return this.debit(amount);
  }

  public applyIncomeEffect(amount: bigint): Either<Error, void> {
    return this.credit(amount);
  }
}
