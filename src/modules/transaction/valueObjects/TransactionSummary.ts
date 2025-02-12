import { ValueObject } from '@shared/core/Entities/ValueObject';

type TransactionSummaryType = {
  date: Date;
  income: number;
  expense: number;
};

export class TransactionSummary extends ValueObject<TransactionSummaryType> {
  constructor(props: TransactionSummaryType) {
    const transactionSummaryProps = {
      ...props,
    };

    super(transactionSummaryProps);
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
}
