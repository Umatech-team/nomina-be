import { ValueObject } from '@shared/core/Entities/ValueObject';

type TransactionSummaryType = {
  date: string | Date;
  income: number;
  expense: number;
  balance: number;
};

export class TransactionSummary extends ValueObject<TransactionSummaryType> {
  constructor(props: TransactionSummaryType) {
    super(props);
  }

  static create(props: TransactionSummaryType) {
    return new TransactionSummary(props);
  }

  get date() {
    return this.props.date;
  }

  get income() {
    return this.props.income;
  }

  get expense() {
    return this.props.expense;
  }

  get balance() {
    return this.props.balance;
  }
}
