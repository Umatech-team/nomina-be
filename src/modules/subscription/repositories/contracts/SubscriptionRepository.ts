import { Subscription } from '@modules/subscription/entities/Subscription';

export abstract class SubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;

  abstract update(subscription: Subscription): Promise<Subscription>;

  abstract findById(id: string): Promise<Subscription | null>;

  abstract findByUserId(
    userId: string,
    status?: string,
  ): Promise<Subscription | null>;
}
