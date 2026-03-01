import { TransactionStatus, TransactionType } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface TransactionProps {
  workspaceId: string;
  accountId: string;
  categoryId: string;
  description: string;
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
      'createdAt' | 'updatedAt' | 'status' | 'recurringId'
    >,
    id?: string,
  ): Either<Error, Transaction> {
    if (props.amount <= 0) {
      return left(
        new HttpException('The amount must be greater than zero', 400),
      );
    }

    if (!props.description || props.description.trim() === '') {
      return left(new HttpException('The description is required', 400));
    }

    if (!props.date) {
      return left(new HttpException('The date is required', 400));
    }

    if (!props.type) {
      return left(new HttpException('The type is required', 400));
    }

    const transactionProps: TransactionProps = {
      ...props,
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

  get categoryId(): string {
    return this.props.categoryId;
  }

  get description(): string {
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

  set description(value: string) {
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

  set categoryId(value: string) {
    this.props.categoryId = value;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
