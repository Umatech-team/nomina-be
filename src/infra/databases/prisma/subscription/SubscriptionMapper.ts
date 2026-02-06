import { SubscriptionStatus } from '@constants/enums';
import { Subscription } from '@modules/subscription/entities/Subscription';
import { Prisma, Subscription as SubscriptionPrisma } from '@prisma/client';

export class SubscriptionMapper {
  static toEntity(raw: SubscriptionPrisma): Subscription {
    return new Subscription(
      {
        userId: raw.userId,
        planId: raw.planId,
        status: raw.status as SubscriptionStatus,
        currentPeriodEnd: raw.currentPeriodEnd,
      },
      raw.id,
    );
  }

  static toPrisma(
    entity: Subscription,
  ): Prisma.SubscriptionUncheckedCreateInput {
    return {
      id: entity.id,
      userId: entity.userId,
      planId: entity.planId,
      status: entity.status,
      currentPeriodEnd: entity.currentPeriodEnd,
    };
  }
}
