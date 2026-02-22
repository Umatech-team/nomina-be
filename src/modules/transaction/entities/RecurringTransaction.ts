import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';
import { InvalidRecurringTransactionError } from '../errors/InvalidRecurringTransactionError';

export interface RecurringTransactionProps {
  workspaceId: string;
  accountId: string;
  categoryId: string | null;
  description: string;
  amount: bigint;
  frequency: RecurrenceFrequency;
  interval: number;
  startDate: Date;
  endDate: Date | null;
  lastGenerated: Date | null;
  active: boolean;
  type: keyof typeof TransactionType;
}

export class RecurringTransaction extends AggregateRoot<RecurringTransactionProps> {
  constructor(props: RecurringTransactionProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<
      RecurringTransactionProps,
      'interval' | 'endDate' | 'lastGenerated' | 'active' | 'categoryId'
    >,
    id?: string,
  ): Either<InvalidRecurringTransactionError, RecurringTransaction> {
    if (props.amount <= 0) {
      return left(
        new InvalidRecurringTransactionError('O valor deve ser maior que zero'),
      );
    }

    if (props.interval !== undefined && props.interval <= 0) {
      return left(
        new InvalidRecurringTransactionError(
          'O intervalo deve ser maior que zero',
        ),
      );
    }

    const recurringTransactionProps: RecurringTransactionProps = {
      ...props,
      interval: props.interval ?? 1,
      endDate: props.endDate ?? null,
      lastGenerated: props.lastGenerated ?? null,
      active: props.active ?? true,
      categoryId: props.categoryId ?? null,
    };

    const recurringTransaction = new RecurringTransaction(
      recurringTransactionProps,
      id,
    );

    return right(recurringTransaction);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get type(): keyof typeof TransactionType {
    return this.props.type;
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

  get amountDecimal(): bigint {
    return this.props.amount / 100n;
  }

  get frequency(): RecurrenceFrequency {
    return this.props.frequency;
  }

  get interval(): number {
    return this.props.interval;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | null {
    return this.props.endDate;
  }

  get lastGenerated(): Date | null {
    return this.props.lastGenerated;
  }

  get active(): boolean {
    return this.props.active;
  }

  set description(value: string) {
    this.props.description = value;
  }

  set amount(value: bigint) {
    this.props.amount = value;
  }

  set categoryId(value: string | null) {
    this.props.categoryId = value;
  }

  set frequency(value: RecurrenceFrequency) {
    this.props.frequency = value;
  }

  set interval(value: number) {
    this.props.interval = value;
  }

  set startDate(value: Date) {
    this.props.startDate = value;
  }

  set endDate(value: Date | null) {
    this.props.endDate = value;
  }

  set lastGenerated(value: Date | null) {
    this.props.lastGenerated = value;
  }

  set type(value: keyof typeof TransactionType) {
    this.props.type = value;
  }

  deactivate(): void {
    this.props.active = false;
  }

  activate(): void {
    this.props.active = true;
  }
}
