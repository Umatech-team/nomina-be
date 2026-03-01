import { ValueObject } from '@shared/core/Entities/ValueObject';

type TopExpensesByCategoryType = {
  categoryId: string;
  categoryName: string;
  amount: number;
};

export class TopExpensesByCategory extends ValueObject<TopExpensesByCategoryType> {
  constructor(props: TopExpensesByCategoryType) {
    const topExpensesByCategoryProps = {
      ...props,
    };

    super(topExpensesByCategoryProps);
  }

  get categoryId() {
    return this.props.categoryId;
  }

  get categoryName() {
    return this.props.categoryName;
  }

  get amount() {
    return this.props.amount;
  }
}
