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
      currentAmount: MoneyUtils.centsToDecimal(goal.currentAmount), // Valor em decimal
      currentAmountFormatted: MoneyUtils.formatCents(goal.currentAmount, 'BRL'), // Valor formatado
      targetAmount: MoneyUtils.centsToDecimal(goal.targetAmount), // Valor em decimal
      targetAmountFormatted: MoneyUtils.formatCents(goal.targetAmount, 'BRL'), // Valor formatado
      monthlyContribution: MoneyUtils.centsToDecimal(goal.monthlyContribution), // Valor em decimal
      monthlyContributionFormatted: MoneyUtils.formatCents(
        goal.monthlyContribution,
        'BRL',
      ), // Valor formatado
    };
  }
}
