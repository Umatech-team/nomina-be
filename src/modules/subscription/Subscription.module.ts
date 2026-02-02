import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CreateSubscriptionController } from './controllers/CreateSubscription.controller';
import { FindSubscriptionByUserController } from './controllers/FindSubscriptionByUser.controller';
import { UpdateSubscriptionController } from './controllers/UpdateSubscription.controller';
import { WebhookController } from './controllers/Webhook.controller';
import { SubscriptionLimitsGuard } from './guards/SubscriptionLimits.guard';
import { CheckSubscriptionLimitsService } from './services/CheckSubscriptionLimits.service';
import { CreateSubscriptionService } from './services/CreateSubscription.service';
import { FindSubscriptionByUserService } from './services/FindSubscriptionByUser.service';
import { ProcessWebhookService } from './services/ProcessWebhook.service';
import { UpdateSubscriptionService } from './services/UpdateSubscription.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateSubscriptionController,
    UpdateSubscriptionController,
    FindSubscriptionByUserController,
    WebhookController,
  ],
  providers: [
    CreateSubscriptionService,
    UpdateSubscriptionService,
    FindSubscriptionByUserService,
    ProcessWebhookService,
    CheckSubscriptionLimitsService,
    SubscriptionLimitsGuard,
  ],
  exports: [CheckSubscriptionLimitsService, SubscriptionLimitsGuard],
})
export class SubscriptionModule {}
