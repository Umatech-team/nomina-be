import { AccountType } from '@constants/enums';
import { Either, left, right } from '@shared/core/errors/Either';
import { BaseAccount, BaseAccountProps } from './BaseAccount';

export interface CheckingAccountProps extends BaseAccountProps {
  balance: bigint;
  type: AccountType;
}

export class CheckingAccount extends BaseAccount<CheckingAccountProps> {
  private constructor(props: CheckingAccountProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<CheckingAccountProps, 'balance'> & { balance?: bigint },
    id?: string,
  ): Either<Error, CheckingAccount> {
    if (props.name.length < 2) return left(new Error('Nome muito curto.'));

    return right(
      new CheckingAccount(
        {
          ...props,
          balance: props.balance ?? 0n,
        },
        id,
      ),
    );
  }

  static reconstitute(
    props: CheckingAccountProps,
    id: string,
  ): CheckingAccount {
    return new CheckingAccount(props, id);
  }

  get type(): string {
    return this.props.type;
  }

  get patrimonyContribution(): bigint {
    return this.balance;
  }

  public debit(amount: bigint): Either<Error, void> {
    if (amount <= 0n) return left(new Error('Valor deve ser positivo.'));
    this.props.balance -= amount;
    return right(undefined);
  }

  public applyExpenseEffect(amount: bigint): Either<Error, void> {
    return this.debit(amount);
  }

  public applyIncomeEffect(amount: bigint): Either<Error, void> {
    return this.credit(amount);
  }
}
