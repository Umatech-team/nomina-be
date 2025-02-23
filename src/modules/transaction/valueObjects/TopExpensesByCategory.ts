import { ValueObject } from '@shared/core/Entities/ValueObject';

type TopExpensesByCategoryType = {
  category: string;
  total: number;
};

export class TopExpensesByCategory extends ValueObject<TopExpensesByCategoryType> {
  constructor(props: TopExpensesByCategoryType) {
    const topExpensesByCategoryProps = {
      ...props,
    };

    super(topExpensesByCategoryProps);
  }

  get category() {
    return this.props.category;
  }

  get total() {
    return this.props.total;
  }
}
