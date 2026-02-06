import { SubscriptionStatus } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';
import { CreateSubscriptionService } from './CreateSubscription.service';
import { UpdateSubscriptionService } from './UpdateSubscription.service';

interface WebhookPayload {
  type:
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.canceled';
  data: {
    subscriptionId?: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodEnd: string; // ISO date
  };
}

@Injectable()
export class ProcessWebhookService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly createService: CreateSubscriptionService,
    private readonly updateService: UpdateSubscriptionService,
  ) {}

  async execute(payload: WebhookPayload): Promise<void> {
    switch (payload.type) {
      case 'subscription.created':
        await this.handleCreate(payload.data);
        break;

      case 'subscription.updated':
        await this.handleUpdate(payload.data);
        break;

      case 'subscription.canceled':
        await this.handleCancel(payload.data);
        break;

      default:
        console.warn(`Unknown webhook type: ${payload.type}`);
    }
  }

  private async handleCreate(data: WebhookPayload['data']) {
    await this.createService.execute({
      userId: data.userId,
      planId: data.planId,
      status: data.status,
      currentPeriodEnd: new Date(data.currentPeriodEnd),
    });
  }

  private async handleUpdate(data: WebhookPayload['data']) {
    const subscription = await this.subscriptionRepository.findByUserId(
      data.userId,
    );

    if (subscription) {
      await this.updateService.execute({
        subscriptionId: subscription.id,
        status: data.status,
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        planId: data.planId,
      });
    }
  }

  private async handleCancel(data: WebhookPayload['data']) {
    const subscription = await this.subscriptionRepository.findByUserId(
      data.userId,
    );

    if (subscription) {
      await this.updateService.execute({
        subscriptionId: subscription.id,
        status: SubscriptionStatus.CANCELED,
      });
    }
  }
}
