import { Subscription } from '@modules/subscription/entities/Subscription';

export abstract class SubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;
  abstract update(subscription: Subscription): Promise<Subscription>;
  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<Subscription | null>;
  abstract findByUserId(userId: string): Promise<Subscription | null>;

  // Para verificar limites de plano
  abstract findActiveByUserId(userId: string): Promise<Subscription | null>;
}
