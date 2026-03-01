import { SubscriptionStatus } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { Subscription } from '@modules/subscription/entities/Subscription';

type SubscriptionDrizzle = typeof schema.subscriptions.$inferSelect;
type SubscriptionDrizzleInsert = typeof schema.subscriptions.$inferInsert;

export class SubscriptionMapper {
  static toDomain(raw: SubscriptionDrizzle): Subscription {
    const result = Subscription.create(
      {
        currentPeriodEnd: raw.currentPeriodEnd,
        planId: raw.planId,
        status: raw.status as SubscriptionStatus,
        userId: raw.userId,
      },
      raw.id,
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toDatabase(entity: Subscription): SubscriptionDrizzleInsert {
    return {
      id: entity.id,
      currentPeriodEnd: entity.currentPeriodEnd,
      planId: entity.planId,
      status: entity.status,
      userId: entity.userId,
    };
  }
}
