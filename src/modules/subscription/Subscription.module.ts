import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { SubscriptionLimitsGuard } from './guards/SubscriptionLimits.guard';
import { CheckSubscriptionLimitsService } from './services/CheckSubscriptionLimits.service';

@Module({
  imports: [DatabaseModule],
  providers: [CheckSubscriptionLimitsService, SubscriptionLimitsGuard],
  exports: [CheckSubscriptionLimitsService, SubscriptionLimitsGuard],
})
export class SubscriptionModule {}
