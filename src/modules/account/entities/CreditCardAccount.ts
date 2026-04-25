import { AccountType } from '@constants/enums';
import { Either, left, right } from '@shared/core/errors/Either';
import { BaseAccount, BaseAccountProps } from './BaseAccount';

export interface CreditCardProps extends BaseAccountProps {
  balance: bigint;
  creditLimit: bigint;
  closingDay: number;
  dueDay: number;
}

export class CreditCard extends BaseAccount<CreditCardProps> {
  private constructor(props: CreditCardProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<CreditCardProps, 'balance'> & { balance?: bigint },
    id?: string,
  ): Either<Error, CreditCard> {
    if (props.creditLimit <= 0n) {
      return left(new Error('O limite de crédito deve ser superior a zero.'));
    }
    if (props.closingDay < 1 || props.closingDay > 31) {
      return left(new Error('Dia de fechamento inválido.'));
    }
    if (props.dueDay < 1 || props.dueDay > 31) {
      return left(new Error('Dia de vencimento inválido.'));
    }

    return right(
      new CreditCard(
        {
          ...props,
          balance: props.balance ?? 0n,
        },
        id,
      ),
    );
  }

  static reconstitute(props: CreditCardProps, id: string): CreditCard {
    return new CreditCard(props, id);
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get creditLimit(): bigint {
    return this.props.creditLimit;
  }

  get closingDay(): number {
    return this.props.closingDay;
  }

  get dueDay(): number {
    return this.props.dueDay;
  }

  get type(): string {
    return AccountType.CREDIT_CARD;
  }

  get availableLimit(): bigint {
    return this.props.creditLimit - this.props.balance;
  }

  get patrimonyContribution(): bigint {
    return -this.balance;
  }

  public registerCharge(amount: bigint): Either<Error, void> {
    if (amount <= 0n) {
      return left(new Error('O valor da cobrança deve ser maior que zero.'));
    }
    if (amount > this.availableLimit) {
      return left(new Error('Limite de crédito insuficiente.'));
    }

    this.props.balance += amount;
    return right(undefined);
  }

  public payInvoice(amount: bigint): Either<Error, void> {
    if (amount <= 0n) {
      return left(new Error('O valor do pagamento deve ser maior que zero.'));
    }

    if (this.props.balance - amount < 0n) {
      return left(
        new Error('O pagamento não pode exceder o valor da fatura atual.'),
      );
    }

    this.props.balance -= amount;
    return right(undefined);
  }

  public updateInvoiceDates(
    closingDay: number,
    dueDay: number,
  ): Either<Error, void> {
    if (closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31) {
      return left(
        new Error('Dias de fechamento e vencimento devem ser válidos.'),
      );
    }
    this.props.closingDay = closingDay;
    this.props.dueDay = dueDay;
    return right(undefined);
  }

  public adjustLimit(newLimit: bigint): Either<Error, void> {
    if (newLimit <= 0n) {
      return left(new Error('O limite de crédito deve ser superior a zero.'));
    }
    this.props.creditLimit = newLimit;
    return right(undefined);
  }
}
