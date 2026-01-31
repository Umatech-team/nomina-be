import { ValueObject } from '@shared/core/Entities/ValueObject';

export type MonthSumarryWithPercentageType = {
  userId: number;
  id: number;
  month: Date;
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number;
  balance: number;
  percentageChanges: {
    income: number;
    expense: number;
    balance: number;
    investments: number;
  };
};

export class MonthSumarryWithPercentage extends ValueObject<MonthSumarryWithPercentageType> {
  constructor(props: MonthSumarryWithPercentageType) {
    const monthSumarryWithPercentageProps = {
      ...props,
    };

    super(monthSumarryWithPercentageProps);
  }

  get userId() {
    return this.props.userId;
  }

  get id() {
    return this.props.id;
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

  get balance() {
    return this.props.balance;
  }

  get percentageChanges() {
    return this.props.percentageChanges;
  }
}
