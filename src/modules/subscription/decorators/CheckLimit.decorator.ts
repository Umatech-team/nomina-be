import { SetMetadata } from '@nestjs/common';
import { RESOURCE_TYPE_KEY } from '../guards/SubscriptionLimits.guard';
import { ResourceType } from '../services/CheckSubscriptionLimits.service';

export const CheckLimit = (resourceType: ResourceType) =>
  SetMetadata(RESOURCE_TYPE_KEY, resourceType);
