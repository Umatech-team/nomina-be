import { Subscription } from '@modules/subscription/entities/Subscription';

export abstract class SubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;

  abstract update(subscription: Subscription): Promise<Subscription>;

  abstract findById(id: string): Promise<Subscription | null>;

  // Fundido: Aceita buscar a assinatura geral mais recente ou a mais recente de um status específico (ex: 'ACTIVE')
  abstract findByUserId(
    userId: string,
    status?: string,
  ): Promise<Subscription | null>;
}
