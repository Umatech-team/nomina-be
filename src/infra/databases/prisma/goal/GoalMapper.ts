import { Goal } from '@modules/goal/entities/Goal';
import { Goal as GoalPrisma, Prisma } from '@prisma/client';

export class GoalMapper {
  static toEntity(raw: GoalPrisma): Goal {
    return new Goal(
      {
        memberId: raw.memberId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        category: raw.category,
        title: raw.title,
        currentAmount: raw.currentAmount,
        monthlyContribution: raw.monthlyContribution,
        targetAmount: raw.targetAmount,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Goal): Prisma.GoalUncheckedCreateInput {
    return {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      memberId: entity.memberId,
      title: entity.title,
      category: entity.category,
      currentAmount: entity.currentAmount,
      monthlyContribution: entity.monthlyContribution,
      targetAmount: entity.targetAmount,
    };
  }
}
