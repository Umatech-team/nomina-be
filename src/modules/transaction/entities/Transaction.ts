import { TransactionStatus, TransactionType } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface TransactionProps {
  workspaceId: string;
  accountId: string;
  categoryId: string | null;
  destinationAccountId: string | null;
  title: string;
  description: string | null;
  amount: bigint;
  date: Date;
  type: keyof typeof TransactionType;
  status: TransactionStatus;
  recurringId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Transaction extends AggregateRoot<TransactionProps> {
  constructor(props: TransactionProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<
      TransactionProps,
      | 'createdAt'
      | 'updatedAt'
      | 'status'
      | 'recurringId'
      | 'description'
      | 'destinationAccountId'
      | 'categoryId'
    >,
    id?: string,
  ): Either<Error, Transaction> {
    if (props.amount <= 0) {
      return left(
        new HttpException('The amount must be greater than zero', 400),
      );
    }

    if (!props.title || props.title.trim() === '') {
      return left(new HttpException('The title is required', 400));
    }

    if (!props.date) {
      return left(new HttpException('The date is required', 400));
    }

    if (!props.type) {
      return left(new HttpException('The type is required', 400));
    }

    if (props.type === 'TRANSFER') {
      if (!props.destinationAccountId) {
        return left(
          new HttpException(
            'Conta destino é obrigatória para transferências',
            400,
          ),
        );
      }
      if (props.destinationAccountId === props.accountId) {
        return left(
          new HttpException(
            'Conta destino deve ser diferente da conta origem',
            400,
          ),
        );
      }
    }

    const transactionProps: TransactionProps = {
      ...props,
      categoryId: props.categoryId ?? null,
      destinationAccountId: props.destinationAccountId ?? null,
      description: props.description ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      status: props.status ?? TransactionStatus.COMPLETED,
      recurringId: props.recurringId ?? null,
    };

    const createdTransaction = new Transaction(transactionProps, id);
    return right(createdTransaction);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get destinationAccountId(): string | null {
    return this.props.destinationAccountId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get amount(): bigint {
    return this.props.amount;
  }

  get amountDecimal(): number {
    return Number(this.props.amount) / 100;
  }

  get date(): Date {
    return this.props.date;
  }

  get type(): keyof typeof TransactionType {
    return this.props.type;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get recurringId(): string | null {
    return this.props.recurringId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  set title(value: string) {
    this.props.title = value;
    this.touch();
  }

  set description(value: string | null) {
    this.props.description = value;
    this.touch();
  }

  set amount(value: bigint) {
    this.props.amount = value;
    this.touch();
  }

  set date(value: Date) {
    this.props.date = value;
    this.touch();
  }

  set type(value: keyof typeof TransactionType) {
    this.props.type = value;
    this.touch();
  }

  set status(value: TransactionStatus) {
    this.props.status = value;
    this.touch();
  }

  set categoryId(value: string | null) {
    this.props.categoryId = value;
    this.touch();
  }

  set destinationAccountId(value: string | null) {
    this.props.destinationAccountId = value;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
