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
        currentAmount: Number(raw.currentAmount), // Converte BigInt para number (centavos)
        monthlyContribution: Number(raw.monthlyContribution), // Converte BigInt para number (centavos)
        targetAmount: Number(raw.targetAmount), // Converte BigInt para number (centavos)
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
      currentAmount: BigInt(entity.currentAmount), // Converte number (centavos) para BigInt
      monthlyContribution: BigInt(entity.monthlyContribution), // Converte number (centavos) para BigInt
      targetAmount: BigInt(entity.targetAmount), // Converte number (centavos) para BigInt
    };
  }
}
