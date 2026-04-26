import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { Subscription } from '@modules/subscription/entities/Subscription';
import { SubscriptionRepository } from '@modules/subscription/repositories/contracts/SubscriptionRepository';
import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import * as schema from '../schema';

@Injectable()
export class SubscriptionRepositoryImplementation implements SubscriptionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(subscription: Subscription): Promise<Subscription> {
    const [createdSubscription] = await this.drizzle.db
      .insert(schema.subscriptions)
      .values(SubscriptionMapper.toDatabase(subscription))
      .returning();

    return SubscriptionMapper.toDomain(createdSubscription);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const [updatedSubscription] = await this.drizzle.db
      .update(schema.subscriptions)
      .set(SubscriptionMapper.toDatabase(subscription))
      .where(eq(schema.subscriptions.id, subscription.id))
      .returning(); // Obrigatório para não quebrar o retorno do domínio

    return SubscriptionMapper.toDomain(updatedSubscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    const [subscription] = await this.drizzle.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, id))
      .limit(1);

    if (!subscription) return null;
    return SubscriptionMapper.toDomain(subscription);
  }

  async findByUserId(
    userId: string,
    status?: string,
  ): Promise<Subscription | null> {
    const [subscription] = await this.drizzle.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.userId, userId),
          status ? eq(schema.subscriptions.status, status) : undefined,
        ),
      )
      .orderBy(desc(schema.subscriptions.currentPeriodEnd)) // OBRIGATÓRIO: Sempre a que vence mais no futuro
      .limit(1);

    if (!subscription) return null;
    return SubscriptionMapper.toDomain(subscription);
  }
}
