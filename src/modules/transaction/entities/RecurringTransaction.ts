import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';
import { statusCode } from '@shared/core/types/statusCode';

export interface RecurringTransactionProps {
  workspaceId: string;
  accountId: string;
  destinationAccountId: string | null;
  categoryId: string;
  title: string;
  description: string | null;
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
      'interval' | 'endDate' | 'lastGenerated' | 'active' | 'description' | 'destinationAccountId'
    >,
    id?: string,
  ): Either<HttpException, RecurringTransaction> {
    if (props.amount <= 0) {
      return left(
        new HttpException(
          'O valor deve ser maior que zero',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.interval !== undefined && props.interval <= 0) {
      return left(
        new HttpException(
          'O intervalo deve ser maior que zero',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.type === 'TRANSFER') {
      if (!props.destinationAccountId) {
        return left(
          new HttpException(
            'Conta destino é obrigatória para transferências',
            statusCode.BAD_REQUEST,
          ),
        );
      }
      if (props.destinationAccountId === props.accountId) {
        return left(
          new HttpException(
            'Conta destino deve ser diferente da conta origem',
            statusCode.BAD_REQUEST,
          ),
        );
      }
    }

    const recurringTransactionProps: RecurringTransactionProps = {
      ...props,
      destinationAccountId: props.destinationAccountId ?? null,
      description: props.description ?? null,
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

  get destinationAccountId(): string | null {
    return this.props.destinationAccountId;
  }

  get categoryId(): string {
    return this.props.categoryId;
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

  set title(value: string) {
    this.props.title = value;
  }

  set description(value: string | null) {
    this.props.description = value;
  }

  set amount(value: bigint) {
    this.props.amount = value;
  }

  set categoryId(value: string) {
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

  set destinationAccountId(value: string | null) {
    this.props.destinationAccountId = value;
  }

  deactivate(): void {
    this.props.active = false;
  }

  activate(): void {
    this.props.active = true;
  }
}
