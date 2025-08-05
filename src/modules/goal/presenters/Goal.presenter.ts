import { MoneyUtils } from '@utils/MoneyUtils';
import { Goal } from '../entities/Goal';

export class GoalPresenter {
  static toHTTP(goal: Goal) {
    return {
      id: goal.id,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      memberId: goal.memberId,
      title: goal.title,
      currentAmount: MoneyUtils.centsToDecimal(goal.currentAmount ?? 0),
      targetAmount: MoneyUtils.centsToDecimal(goal.targetAmount ?? 0),
      monthlyContribution: MoneyUtils.centsToDecimal(
        goal.monthlyContribution ?? 0,
      ),
    };
  }
}
