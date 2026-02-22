import { TransactionStatus, TransactionType } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface TransactionProps {
  workspaceId: string;
  accountId: string;
  categoryId: string | null;
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
  constructor(
    props: Optional<
      TransactionProps,
      'createdAt' | 'updatedAt' | 'status' | 'categoryId' | 'recurringId'
    >,
    id?: string,
  ) {
    const transactionProps: TransactionProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      status: props.status ?? TransactionStatus.COMPLETED,
      categoryId: props.categoryId ?? null,
      recurringId: props.recurringId ?? null,
    };

    super(transactionProps, id);
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

  set categoryId(value: string | null) {
    this.props.categoryId = value;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
