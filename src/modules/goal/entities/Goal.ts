import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { GoalDTO } from '../dto/GoalDTO';

export class Goal extends AggregateRoot<GoalDTO> {
  constructor(
    props: Optional<GoalDTO, 'createdAt' | 'updatedAt'>,
    id?: number,
  ) {
    const transactionProps: GoalDTO = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      title: props.title,
      memberId: props.memberId,
      targetAmount: props.targetAmount,
      currentAmount: props.currentAmount,
      monthlyContribution: props.monthlyContribution,
    };

    super(transactionProps, id);
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get memberId() {
    return this.props.memberId;
  }

  get targetAmount() {
    return this.props.targetAmount;
  }

  set targetAmount(targetAmount: number) {
    this.props.targetAmount = targetAmount;
    this.touch();
  }

  set memberId(memberId: number) {
    this.props.memberId = memberId;
    this.touch();
  }

  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  get currentAmount() {
    return this.props.currentAmount;
  }

  set currentAmount(currentAmount: number) {
    this.props.currentAmount = currentAmount;
    this.touch();
  }

  get monthlyContribution() {
    return this.props.monthlyContribution;
  }

  set monthlyContribution(monthlyContribution: number) {
    this.props.monthlyContribution = monthlyContribution;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
