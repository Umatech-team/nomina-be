import { AccountType } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';
import { statusCode } from '@shared/core/types/statusCode';
import { MoneyUtils } from '@utils/MoneyUtils';

export interface AccountProps {
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: bigint;
  icon: string | null;
  color: string | null;
  closingDay: number | null;
  dueDay: number | null;
  creditLimit: bigint | null;
}

export class Account extends AggregateRoot<AccountProps> {
  constructor(props: AccountProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<
      AccountProps,
      'icon' | 'color' | 'closingDay' | 'dueDay' | 'creditLimit'
    >,
    id?: string,
  ): Either<HttpException, Account> {
    if (!props.workspaceId) {
      return left(
        new HttpException(
          'Workspace ID is required to create an account.',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.name.length < 2 || props.name.length > 50) {
      return left(
        new HttpException(
          'Account name must be between 2 and 50 characters.',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.balance < 0n) {
      return left(
        new HttpException(
          'Initial balance cannot be negative.',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.type === AccountType.CREDIT_CARD) {
      if (!props.closingDay) {
        return left(
          new HttpException(
            'Dia de fechamento é obrigatório para cartão de crédito',
            statusCode.BAD_REQUEST,
          ),
        );
      }
      if (!props.dueDay) {
        return left(
          new HttpException(
            'Dia de vencimento é obrigatório para cartão de crédito',
            statusCode.BAD_REQUEST,
          ),
        );
      }
    }

    if (
      props.creditLimit !== undefined &&
      props.creditLimit !== null &&
      props.creditLimit <= 0n
    ) {
      return left(
        new HttpException(
          'Limite de crédito deve ser positivo',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const createdAccount: AccountProps = {
      ...props,
      icon: props.icon ?? null,
      color: props.color ?? null,
      closingDay: props.closingDay ?? null,
      dueDay: props.dueDay ?? null,
      creditLimit: props.creditLimit ?? null,
    };

    const account = new Account(createdAccount, id);

    return right(account);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): AccountType {
    return this.props.type;
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get balanceDecimal(): number {
    return Number(this.props.balance) / 100;
  }

  get icon(): string | null {
    return this.props.icon;
  }

  get color(): string | null {
    return this.props.color;
  }

  get closingDay(): number | null {
    return this.props.closingDay;
  }

  get dueDay(): number | null {
    return this.props.dueDay;
  }

  set name(value: string) {
    this.props.name = value;
  }

  set type(value: AccountType) {
    this.props.type = value;
  }

  set balance(value: bigint) {
    this.props.balance = value;
  }

  set icon(value: string | null) {
    this.props.icon = value;
  }

  set color(value: string | null) {
    this.props.color = value;
  }

  set closingDay(value: number | null) {
    this.props.closingDay = value;
  }

  set dueDay(value: number | null) {
    this.props.dueDay = value;
  }

  get creditLimit(): bigint | null {
    return this.props.creditLimit;
  }

  set creditLimit(value: bigint | null) {
    this.props.creditLimit = value;
  }

  get creditLimitDecimal(): number | null {
    return this.props.creditLimit === null
      ? null
      : MoneyUtils.centsToDecimal(Number(this.props.creditLimit));
  }

  get availableLimit(): bigint | null {
    if (this.props.creditLimit === null) return null;
    return this.props.creditLimit + this.props.balance;
  }

  get availableLimitDecimal(): number | null {
    return this.availableLimit === null
      ? null
      : MoneyUtils.centsToDecimal(Number(this.availableLimit));
  }

  addToBalance(amount: bigint): void {
    this.props.balance += amount;
  }

  subtractFromBalance(amount: bigint): void {
    this.props.balance -= amount;
  }
}
