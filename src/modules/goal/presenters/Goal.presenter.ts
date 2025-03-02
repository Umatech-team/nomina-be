import { Goal } from '../entities/Goal';

export class GoalPresenter {
  static toHTTP(goal: Goal) {
    return {
      id: goal.id,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      memberId: goal.memberId,
      title: goal.title,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      monthlyContribution: goal.monthlyContribution,
    };
  }
}
