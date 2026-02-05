import { ValueObject } from '@shared/core/Entities/ValueObject';

export type MonthSummaryType = {
  month: Date;
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number;
  rate: {
    currentMonthSaving: number;
    previousMonthCompareSaving: number;
  };
};

export class MonthSummary extends ValueObject<MonthSummaryType> {
  constructor(props: MonthSummaryType) {
    super(props);
  }

  static create(props: MonthSummaryType): MonthSummary {
    return new MonthSummary(props);
  }

  get month() {
    return this.props.month;
  }

  get totalIncome() {
    return this.props.totalIncome;
  }

  get totalExpense() {
    return this.props.totalExpense;
  }

  get totalInvestments() {
    return this.props.totalInvestments;
  }

  get rate() {
    return this.props.rate;
  }
}
