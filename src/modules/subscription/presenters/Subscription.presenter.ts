import { Subscription } from '../entities/Subscription';

export class SubscriptionPresenter {
  static toHTTP(subscription: Subscription) {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isActive: subscription.isActive(),
      isExpired: subscription.isExpired(),
    };
  }
}
